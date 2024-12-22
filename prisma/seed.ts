import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import axios from "axios";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // Generate Random Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          role: faker.helpers.arrayElement(["user", "teacher", "admin"]),
          image: faker.image.avatar(),
        },
      }),
    ),
  );

  // Generate Random Classes
  const classes = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.class.create({
        data: {
          name: faker.commerce.department(),
        },
      }),
    ),
  );

  // Connect Random Users to Random Classes
  for (const user of users) {
    const randomClass = faker.helpers.arrayElement(classes);
    await prisma.class.update({
      where: { id: randomClass.id },
      data: {
        users: {
          connect: { id: user.id },
        },
      },
    });
  }

  // Generate Random Packages for Classes
  const packages = [];
  for (const classItem of classes) {
    for (let i = 0; i < 2; i++) {
      const TOstart = faker.date.future();
      const TOend = faker.date.future({ refDate: TOstart }); // Ensure end date is after start date
      const newPackage = await prisma.package.create({
        data: {
          name: faker.company.catchPhrase(),
          type: faker.helpers.arrayElement(["tryout", "drill"]),
          TOstart,
          TOend,
          classId: classItem.id,
        },
      });
      packages.push(newPackage);
    }
  }

  // Generate Random Subtests for Packages
  for (const packageItem of packages) {
    for (let i = 0; i < 3; i++) {
      const subtest = await prisma.subtest.create({
        data: {
          type: faker.helpers.arrayElement([
            "pu",
            "ppu",
            "pbm",
            "pk",
            "lb",
            "pm",
          ]),
          duration: faker.number.int({ min: 30, max: 120 }),
          packageId: packageItem.id,
        },
      });

      // Generate Random Questions and Answers for Subtest
      for (let j = 0; j < 5; j++) {
        const question = await prisma.question.create({
          data: {
            index: j + 1,
            content: faker.lorem.sentence(),
            imageUrl: faker.image.url(),
            type: faker.helpers.arrayElement(["essay", "mulChoice"]),
            score: faker.number.int({ min: 0, max: 10 }),
            packageId: packageItem.id,
            subtestId: subtest.id,
          },
        });

        // Generate Answers for Question
        const answers = await Promise.all(
          Array.from({ length: 4 }).map((_, index) =>
            prisma.answer.create({
              data: {
                index: index + 1,
                content: faker.lorem.word(),
                questionId: question.id,
              },
            }),
          ),
        );

        // Assign Correct Answer Randomly
        const correctAnswer = faker.helpers.arrayElement(answers);
        await prisma.question.update({
          where: { id: question.id },
          data: { correctAnswerChoice: correctAnswer.index }, // Store the index as the correct choice
        });
      }
    }
  }

  // Generate Random QuizSessions and UserAnswers
  for (const user of users) {
    for (const packageItem of packages) {
      const subtests = await prisma.subtest.findMany({
        where: { packageId: packageItem.id },
      });
      for (const subtest of subtests) {
        const quizSession = await prisma.quizSession.create({
          data: {
            userId: user.id,
            packageId: packageItem.id,
            subtestId: subtest.id,
            duration: faker.number.int({
              min: 10,
              max: subtest.duration || 60,
            }),
          },
        });

        const questions = await prisma.question.findMany({
          where: { subtestId: subtest.id },
        });
        for (const question of questions) {
          const randomAnswer = faker.number.int({ min: 1, max: 4 });
          await prisma.userAnswer.create({
            data: {
              answerChoice: randomAnswer,
              questionId: question.id,
              userId: user.id,
              packageId: packageItem.id,
              quizSessionId: quizSession.id,
            },
          });
        }
      }
    }
  }

  // Generate Random Videos
  const fetchYouTubeVideos = async (query, maxResults = 10) => {
    const url = "https://www.googleapis.com/youtube/v3/search";
    try {
      const response = await axios.get(url, {
        params: {
          part: "snippet",
          q: query,
          type: "video",
          maxResults,
          key: process.env.GOOGLE_API_KEY,
        },
      });

      return response.data.items.map((item) => ({
        title: item.snippet.title,
        description: item.snippet.description,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      return [];
    }
  };

  const searchQuery = "utbk";

  const videos = await fetchYouTubeVideos(searchQuery, 10);

  if (videos.length === 0) {
    console.log("No videos fetched from YouTube.");
    return;
  }

  try {
    await prisma.video.createMany({
      data: videos.map((video) => ({
        title: video.title,
        description: video.description,
        url: video.url,
      })),
      skipDuplicates: true, // Opsional: Menghindari duplikasi jika ada unique constraint
    });
    console.log(
      `Successfully created ${videos.length} videos from YouTube API.`,
    );
  } catch (error) {
    console.error("Error creating videos:", error);
  }

  // Generate Random Files
  await prisma.file.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      title: faker.lorem.words(2),
      description: faker.lorem.sentence(),
      url: faker.internet.url(),
    })),
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
