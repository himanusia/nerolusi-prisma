import { NextResponse } from 'next/server';
import { auth } from '~/server/auth';
import { db } from '~/server/db';
import { generateCertificate } from '~/lib/certificate-generator';

export async function GET(
  { params }: { params: Promise<{ packageId: string }> }
) {
  try {
    // Get the authenticated user
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { packageId } = await params;
    const userId = session.user.id;

    // Fetch package data with subtests and quiz sessions
    const packageData = await db.package.findUnique({
      where: { id: packageId },
      include: {
        subtests: {
          include: {
            quizSession: {
              where: { userId },
              orderBy: { startTime: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Check if the tryout has ended
    const isPackageEndDatePassed =
      packageData.TOend && new Date(packageData.TOend) < new Date();

    if (!isPackageEndDatePassed) {
      return NextResponse.json(
        { error: 'Certificate not available yet. Please wait until the tryout ends.' },
        { status: 403 }
      );
    }

    // Fetch user data
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        birthDate: true,
        birthPlace: true,
        school: true,
      },
    });

    if (!user || !user.name || !user.birthDate || !user.birthPlace || !user.school) {
      return NextResponse.json(
        { error: 'User profile incomplete. Please update your profile with name, birth date, birth place, and school.' },
        { status: 400 }
      );
    }

    // Calculate scores
    const subtestOrder = ['pu', 'ppu', 'pbm', 'pk', 'lbi', 'lbe', 'pm'];
    const sortedSubtests = packageData.subtests.sort((a, b) => {
      const indexA = subtestOrder.indexOf(a.type);
      const indexB = subtestOrder.indexOf(b.type);
      return indexA - indexB;
    });

    const totalQuestions =
      sortedSubtests.reduce(
        (sum, subtest) => sum + (subtest.quizSession[0]?.numQuestion ?? 0),
        0
      ) || 0;

    const totalCorrect =
      sortedSubtests.reduce(
        (sum, subtest) => sum + (subtest.quizSession[0]?.numCorrect ?? 0),
        0
      ) || 0;

    const totalAnswered =
      sortedSubtests.reduce(
        (sum, subtest) => sum + (subtest.quizSession[0]?.numAnswered ?? 0),
        0
      ) || 0;

    const totalEmpty = totalQuestions - totalAnswered;
    const totalWrong = totalQuestions - totalCorrect - totalEmpty;

    const averageScore =
      sortedSubtests.reduce(
        (sum, subtest) => sum + (subtest.quizSession[0]?.score ?? 0),
        0
      ) / (sortedSubtests.length || 1) || 0;

    // Get individual scores
    const getScoreByType = (type: string) => {
      const subtest = sortedSubtests.find((s) => s.type === type);
      return subtest?.quizSession[0]?.score ?? 0;
    };

    const testDate = packageData.TOend || new Date();
    const testYear = testDate.getFullYear();
    
    const testName = packageData.name;

    // Generate certificate
    const pdfBytes = await generateCertificate({
      name: user.name,
      birthDate: user.birthDate,
      birthPlace: user.birthPlace,
      school: user.school,
      testDate: testDate,
      testName: testName,
      testYear: testYear,
      averageScore: averageScore,
      correctAnswers: totalCorrect,
      wrongAnswers: totalWrong,
      emptyAnswers: totalEmpty,
      scores: {
        kpu: getScoreByType('pu'),
        kk: getScoreByType('pk'),
        kpbm: getScoreByType('ppu'),
        kmbm: getScoreByType('pbm'),
        lbi: getScoreByType('lbi'),
        lbe: getScoreByType('lbe'),
        pm: getScoreByType('pm'),
      },
    });

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Sertifikat_${user.name.replace(/\s+/g, '_')}_${packageData.name.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { 
        error: 'Failed to generate certificate',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
