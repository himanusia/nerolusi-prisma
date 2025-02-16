import { PrismaClient } from "@prisma/client";
import xlsx from "xlsx";

const prisma = new PrismaClient();

async function generateExcel() {
  const packageId = 1;

  const subtests = await prisma.subtest.findMany({
    where: { packageId },
    include: {
      questions: {
        include: {
          userAnswers: {
            include: { user: true },
          },
          answers: true,
        },
      },
    },
  });

  const workbook = xlsx.utils.book_new();
  const overallScores = [["User ID", "Nama", "Total Skor", "Rata-rata Skor"]];
  const userTotalScores = {};

  for (const subtest of subtests) {
    const data = [["User ID", "Nama"]];
    const userScores = {};
    const questionDifficulties = [];

    subtest.questions.forEach((_, index) => {
      data[0].push(`Soal ${index + 1}`);
    });
    data[0].push("Benar", "Salah", "Skor");

    for (const question of subtest.questions) {
      let correctCount = 0;
      let totalResponses = question.userAnswers.length;

      for (const userAnswer of question.userAnswers) {
        if (question.correctAnswerChoice !== null) {
          if (userAnswer.answerChoice === question.correctAnswerChoice) {
            correctCount++;
          }
        } else if (userAnswer.essayAnswer !== null) {
          const isCorrect =
            userAnswer.essayAnswer.trim().toLowerCase() ===
            question.answers[0]?.content.trim().toLowerCase();
          if (isCorrect) {
            correctCount++;
          }
        }
      }

      const difficultyFactor =
        totalResponses > 0 ? 1 - correctCount / totalResponses : 1;
      questionDifficulties.push(difficultyFactor);
    }

    const totalDifficulty = questionDifficulties.reduce((a, b) => a + b, 0);
    const questionScores = subtest.questions.map((_, index) => {
      return totalDifficulty > 0
        ? (1000 * questionDifficulties[index]) / totalDifficulty
        : 1000 / subtest.questions.length;
    });

    for (let i = 0; i < subtest.questions.length; i++) {
      const question = subtest.questions[i];
      const questionScore = questionScores[i];

      for (const userAnswer of question.userAnswers) {
        const userId = userAnswer.user.id;
        if (!userScores[userId]) {
          userScores[userId] = {
            name: userAnswer.user.name || "Unknown",
            correct: 0,
            incorrect: 0,
            score: 0,
            questionResults: new Array(subtest.questions.length).fill(""),
          };
        }
        if (!userTotalScores[userId]) {
          userTotalScores[userId] = {
            name: userAnswer.user.name || "Unknown",
            totalScore: 0,
            subtestCount: 0,
          };
        }

        let isCorrect = false;
        if (question.correctAnswerChoice !== null) {
          isCorrect = userAnswer.answerChoice === question.correctAnswerChoice;
        } else if (userAnswer.essayAnswer !== null) {
          isCorrect =
            userAnswer.essayAnswer.trim().toLowerCase() ===
            question.answers[0]?.content.trim().toLowerCase();
        }

        if (isCorrect) {
          userScores[userId].correct++;
          userScores[userId].score += questionScore;
          userScores[userId].questionResults[i] = 1;
          userTotalScores[userId].totalScore += questionScore;
        } else {
          userScores[userId].incorrect++;
          userScores[userId].questionResults[i] = 0;
        }
      }
    }

    for (const [userId, stats] of Object.entries(userScores)) {
      data.push([
        userId,
        stats.name,
        ...stats.questionResults,
        stats.correct,
        stats.incorrect,
        stats.score.toFixed(2),
      ]);
    }

    const worksheet = xlsx.utils.aoa_to_sheet(data);
    xlsx.utils.book_append_sheet(
      workbook,
      worksheet,
      `Subtest ${subtest.type}`,
    );

    for (const userId of Object.keys(userScores)) {
      userTotalScores[userId].subtestCount++;
    }
  }

  const sortedOverallScores = Object.entries(userTotalScores)
    .map(([userId, stats]) => {
      const avgScore =
        stats.subtestCount > 0
          ? (stats.totalScore / stats.subtestCount).toFixed(2)
          : "0.00";
      return [userId, stats.name, stats.totalScore.toFixed(2), avgScore];
    })
    .sort((a, b) => parseFloat(b[3]) - parseFloat(a[3]));

  overallScores.push(...sortedOverallScores);

  const overallSheet = xlsx.utils.aoa_to_sheet(overallScores);
  xlsx.utils.book_append_sheet(workbook, overallSheet, "Total & Rata-rata");

  xlsx.writeFile(workbook, "hasil_tryout1.xlsx");
  console.log('File "hasil_tryout1.xlsx" berhasil dibuat!');
}

generateExcel()
  .catch((err) => {
    console.error("Terjadi kesalahan:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
