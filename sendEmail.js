import { PrismaClient } from "@prisma/client";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmails() {
  const packageId = 2;

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

  const userTotalScores = {};

  for (const subtest of subtests) {
    const userScores = {};
    const questionDifficulties = [];

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
            email: userAnswer.user.email || null,
            score: 0,
          };
        }
        if (!userTotalScores[userId]) {
          userTotalScores[userId] = {
            name: userAnswer.user.name || "Unknown",
            email: userAnswer.user.email || null,
            totalScore: 0,
            subtestCount: 0,
            scores: {},
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
          userScores[userId].score += questionScore;
          userTotalScores[userId].totalScore += questionScore;
        }

        userTotalScores[userId].scores[subtest.type] =
          // (userTotalScores[userId].scores[subtest.type] || 0) + questionScore;
          userScores[userId].score + 100;
      }
    }

    for (const userId of Object.keys(userScores)) {
      userTotalScores[userId].subtestCount++;
    }
  }

  for (const [userId, userData] of Object.entries(userTotalScores)) {
    if (!userData.email) {
      console.warn(`User ${userData.name} tidak memiliki email, lewati.`);
      continue;
    }

    const scoresHtml = Object.entries(userData.scores)
      .map(
        ([subtest, score]) =>
          `<li><strong>${mapSubtestName(subtest)}:</strong> ${score.toFixed(
            2,
          )}</li>`,
      )
      .join("");

    const emailHtml = `
        <h2>Halo, ${userData.name}!</h2>
        <p>Haloo peserta Try Out ITBxUGM Jombang! Terima kasih banyak telah mengikuti try out yang kami adakan! Semoga dengan adanya kontribusi kecil dari kami, dapat membantu kalian untuk lebih mempersiapkan SNBT nantinya!</p>
        <p>Berikut adalah hasil tryout kamu:</p>
        <ul>${scoresHtml}</ul>
        <p>Jika merasa masih belum puas dengan hasilnya, jangan khawatir! Setiap langkah yang kamu ambil adalah sebuah pijakan yang berarti untuk langkah-langkah kamu ke depannya. Jadi tetap semangat, ya! 🚀</p>
        <p>- Panitia Tryout ITBxUGM Jombang -</p>
      `;

    try {
      const response = await resend.emails.send({
        from: "Tryout ITBxUGM <noreply@itbjo.com>",
        to: [userData.email],
        subject: "Hasil Try Out ITBxUGM Jombang",
        html: emailHtml,
      });

      console.log(`Email sukses dikirim ke ${userData.email}`, response);
      console.log(`${emailHtml}\n`);
    } catch (error) {
      console.error(`Gagal mengirim email ke ${userData.email}:`, error);
    }
  }

  await prisma.$disconnect();
}

function mapSubtestName(subtest) {
  const subtestMap = {
    pu: "Kemampuan Penalaran Umum",
    ppu: "Pengetahuan dan Pemahaman Umum",
    pbm: "Kemampuan Memahami Bacaan dan Menulis",
    pk: "Pengetahuan Kuantitatif",
    pm: "Penalaran Matematika",
    lbe: "Literasi Bahasa Inggris",
    lbi: "Literasi Bahasa Indonesia",
  };
  return subtestMap[subtest] || subtest;
}

sendEmails().catch((err) => console.error("Terjadi kesalahan:", err));
