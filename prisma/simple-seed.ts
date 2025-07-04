import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Creating simple tryout data for testing...");

  // Create a test user
  const testUser = await db.user.upsert({
    where: { email: "bertha.soliany@gmail.com" },
    update: {},
    create: {},
  });

  // Create a test class
  const existingClass = await db.class.findFirst({
    where: { name: "Test Class" }
  });
  
  const testClass = existingClass || await db.class.create({
    data: {
      name: "Test Class",
      users: {
        connect: { id: testUser.id }
      }
    },
  });

  // Update user with class
  await db.user.update({
    where: { id: testUser.id },
    data: { classid: testClass.id }
  });

  // Create a tryout package
  const now = new Date();
  const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  const endTime = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

  const existingPackage = await db.package.findFirst({
    where: { name: "Try Out UTBK #1 2026" }
  });

  const tryoutPackage = existingPackage || await db.package.create({
    data: {
      name: "Try Out UTBK #1 2026",
      type: "tryout",
      TOstart: startTime,
      TOend: endTime,
      classId: testClass.id,
    },
  });

  // Create a completed tryout package (end date has passed)
  const completedStartTime = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
  const completedEndTime = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (already passed)

  const existingCompletedPackage = await db.package.findFirst({
    where: { name: "Try Out UTBK Completed #1 2026" }
  });

  const completedTryoutPackage = existingCompletedPackage || await db.package.create({
    data: {
      name: "Try Out UTBK Completed #1 2026",
      type: "tryout",
      TOstart: completedStartTime,
      TOend: completedEndTime,
      classId: testClass.id,
    },
  });

  // Create subtests - but only if they don't exist
  const subtestTypes = [
    { type: "pu" as const, name: "Kemampuan Penalaran Umum", duration: 15 },
    { type: "ppu" as const, name: "Pengetahuan dan Pemahaman Umum", duration: 20 },
    { type: "pbm" as const, name: "Kemampuan Memahami Bacaan dan Menulis", duration: 25 },
    { type: "pk" as const, name: "Pengetahuan Kuantitatif", duration: 20 },
    { type: "pm" as const, name: "Penalaran Matematika", duration: 20 },
    { type: "lbi" as const, name: "Literasi Bahasa Indonesia", duration: 25 },
    { type: "lbe" as const, name: "Literasi Bahasa Inggris", duration: 15 },
  ];

  // Check if subtests already exist for this package
  const existingSubtests = await db.subtest.findMany({
    where: { packageId: tryoutPackage.id }
  });

  if (existingSubtests.length === 0) {
    console.log("Creating subtests...");
    
    for (const subtestInfo of subtestTypes) {
      const subtest = await db.subtest.create({
        data: {
          type: subtestInfo.type,
          duration: subtestInfo.duration,
          packageId: tryoutPackage.id,
        },
      });

      // Create questions for each subtest
      const questionsPerSubtest = subtestInfo.type === "pu" ? 15 : 
                                 subtestInfo.type === "ppu" ? 10 : 
                                 subtestInfo.type === "pbm" ? 20 : 
                                 subtestInfo.type === "pk" ? 15 : 
                                 subtestInfo.type === "pm" ? 20 : 
                                 subtestInfo.type === "lbi" ? 30 : 
                                 subtestInfo.type === "lbe" ? 20 : 20;

      for (let i = 1; i <= questionsPerSubtest; i++) {
        // Randomize correct answer between 1-5
        const correctAnswer = Math.floor(Math.random() * 5) + 1;
        
        const question = await db.question.create({
          data: {
            index: i,
            content: `<p>Soal ${i} untuk ${subtestInfo.name}. Manakah dari pilihan berikut yang paling tepat?</p>`,
            type: "mulChoice",
            score: 5,
            packageId: tryoutPackage.id,
            subtestId: subtest.id,
            correctAnswerChoice: correctAnswer,
            explanation: `<p>Pembahasan untuk soal ${i}: Jawaban yang benar adalah pilihan ${String.fromCharCode(64 + correctAnswer)} karena sesuai dengan konsep yang dibahas.</p>`,
          },
        });

        // Create answer choices
        const answerChoices = ["A", "B", "C", "D", "E"];
        for (let j = 0; j < 5; j++) {
          await db.answer.create({
            data: {
              index: j + 1,
              content: `Pilihan ${answerChoices[j]} untuk soal ${i}`,
              questionId: question.id,
            },
          });
        }
      }
    }
  } else {
    console.log("Subtests already exist, skipping creation...");
  }

  // Create subtests for the completed package
  const existingCompletedSubtests = await db.subtest.findMany({
    where: { packageId: completedTryoutPackage.id }
  });

  if (existingCompletedSubtests.length === 0) {
    console.log("Creating subtests for completed package...");
    
    for (const subtestInfo of subtestTypes) {
      const subtest = await db.subtest.create({
        data: {
          type: subtestInfo.type,
          duration: subtestInfo.duration,
          packageId: completedTryoutPackage.id,
        },
      });

      // Create questions for each subtest
      const questionsPerSubtest = subtestInfo.type === "pu" ? 15 : 
                                 subtestInfo.type === "ppu" ? 10 : 
                                 subtestInfo.type === "pbm" ? 20 : 
                                 subtestInfo.type === "pk" ? 15 : 
                                 subtestInfo.type === "pm" ? 20 : 
                                 subtestInfo.type === "lbi" ? 30 : 
                                 subtestInfo.type === "lbe" ? 20 : 20;

      const questions = [];
      for (let i = 1; i <= questionsPerSubtest; i++) {
        // Randomize correct answer between 1-5
        const correctAnswer = Math.floor(Math.random() * 5) + 1;
        
        const question = await db.question.create({
          data: {
            index: i,
            content: `<p>Soal ${i} untuk ${subtestInfo.name}. Manakah dari pilihan berikut yang paling tepat?</p>`,
            type: "mulChoice",
            score: 5,
            packageId: completedTryoutPackage.id,
            subtestId: subtest.id,
            correctAnswerChoice: correctAnswer,
            explanation: `<p>Pembahasan untuk soal ${i}: Jawaban yang benar adalah pilihan ${String.fromCharCode(64 + correctAnswer)} karena sesuai dengan konsep yang dibahas.</p>`,
          },
        });

        questions.push({ id: question.id, correctAnswer });

        // Create answer choices
        const answerChoices = ["A", "B", "C", "D", "E"];
        for (let j = 0; j < 5; j++) {
          await db.answer.create({
            data: {
              index: j + 1,
              content: `Pilihan ${answerChoices[j]} untuk soal ${i}`,
              questionId: question.id,
            },
          });
        }
      }

      // Create a completed quiz session for this subtest
      const sessionStartTime = new Date(completedStartTime.getTime() + Math.random() * 5 * 24 * 60 * 60 * 1000); // Random time during the test period
      const sessionEndTime = new Date(sessionStartTime.getTime() + subtestInfo.duration * 60 * 1000); // Duration in minutes

      const quizSession = await db.quizSession.create({
        data: {
          userId: testUser.id,
          packageId: completedTryoutPackage.id,
          subtestId: subtest.id,
          startTime: sessionStartTime,
          endTime: sessionEndTime,
          duration: subtestInfo.duration,
        },
      });

      // Create user answers with realistic performance (70-85% correct)
      let correctAnswers = 0;
      for (const question of questions) {
        const isCorrect = Math.random() < 0.75; // 75% chance of correct answer
        const userChoice = isCorrect ? question.correctAnswer : Math.floor(Math.random() * 5) + 1;
        
        if (isCorrect) correctAnswers++;

        await db.userAnswer.create({
          data: {
            userId: testUser.id,
            packageId: completedTryoutPackage.id,
            questionId: question.id,
            answerChoice: userChoice,
            essayAnswer: null,
            quizSessionId: quizSession.id,
          },
        });
      }

      console.log(`✅ Created completed session for ${subtestInfo.name} with ${correctAnswers}/${questionsPerSubtest} correct answers`);
    }
  } else {
    console.log("Completed package subtests already exist, skipping creation...");
  }

  console.log("✅ Test tryout data created successfully!");
  console.log("📝 User:", testUser.email);
  console.log("🏫 Class:", testClass.name);
  console.log("📋 Active Package:", tryoutPackage.name);
  console.log("📋 Completed Package:", completedTryoutPackage.name);
  console.log("🎯 Subtests:", subtestTypes.length);
  console.log("\n🚀 You can test the active tryout at: /tryout/" + tryoutPackage.id);
  console.log("🏆 You can view completed scores at: /tryout/" + completedTryoutPackage.id + "/scores");
  console.log("\n💡 To reset answers and start fresh, run: bun run prisma/simple-seed.ts reset");
}

async function resetAnswers() {
  console.log("🔄 Resetting quiz sessions and answers...");

  // Find the tryout package
  const tryoutPackage = await db.package.findFirst({
    where: { name: "Try Out UTBK #1 2026" }
  });

  if (!tryoutPackage) {
    console.log("No tryout package found.");
    return;
  }

  console.log(`Found package: ${tryoutPackage.name}`);

  // Delete all user answers for this package
  const deletedAnswers = await db.userAnswer.deleteMany({
    where: { packageId: tryoutPackage.id }
  });
  console.log(`Deleted ${deletedAnswers.count} user answers`);

  // Delete all quiz sessions for this package
  const deletedSessions = await db.quizSession.deleteMany({
    where: { packageId: tryoutPackage.id }
  });
  console.log(`Deleted ${deletedSessions.count} quiz sessions`);

  // Delete all answers for questions in this package
  const deletedAnswerChoices = await db.answer.deleteMany({
    where: { 
      question: { packageId: tryoutPackage.id }
    }
  });
  console.log(`Deleted ${deletedAnswerChoices.count} answer choices`);

  // Delete all questions for this package
  const deletedQuestions = await db.question.deleteMany({
    where: { packageId: tryoutPackage.id }
  });
  console.log(`Deleted ${deletedQuestions.count} questions`);

  // Delete all subtests for this package
  const deletedSubtests = await db.subtest.deleteMany({
    where: { packageId: tryoutPackage.id }
  });
  console.log(`Deleted ${deletedSubtests.count} subtests`);

  console.log("✅ All data has been completely reset!");
  console.log("🎯 You can now run the seed again to create fresh data!");
}

// Check if this script is called with 'reset' argument
const args = process.argv.slice(2);
if (args.includes('reset')) {
  resetAnswers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
} else {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}
