import { faker } from "@faker-js/faker";
import { PrismaClient, VideoType } from "@prisma/client";
import axios from "axios";
import { SUBJECT_CATEGORIES } from "../src/app/_components/constants.js";

const db = new PrismaClient();

async function main() {
  console.log("⚠️  Clearing existing data and seeding database...");
  // Clear existing data
  // await db.userAnswerChoice.deleteMany();
  // await db.userAnswer.deleteMany();
  // await db.quizSession.deleteMany();
  // await db.answer.deleteMany();
  // await db.question.deleteMany();
  // await db.topic.deleteMany();
  // await db.material.deleteMany();
  // await db.subject.deleteMany();
  // await db.file.deleteMany();
  // await db.folder.deleteMany();
  // await db.subtest.deleteMany();
  // await db.package.deleteMany();
  // await db.video.deleteMany();
  // await db.class.deleteMany();
  // await db.user.deleteMany();

  console.log("Seeding data...");

  // Generate Random Users
  // const users = await Promise.all(
  //   Array.from({ length: 10 }).map(() =>
  //     db.user.create({
  //       data: {
  //         name: faker.person.fullName(),
  //         email: faker.internet.email(),
  //         role: faker.helpers.arrayElement(["user", "teacher", "admin"]),
  //         image: faker.image.avatar(),
  //       },
  //     }),
  //   ),
  // );

  // Generate Random Classes
  // const classes = await Promise.all(
  //   Array.from({ length: 5 }).map(() =>
  //     db.class.create({
  //       data: {
  //         name: faker.commerce.department(),
  //       },
  //     }),
  //   ),
  // );

  // Connect Random Users to Random Classes
  // for (const user of users) {
  //   const randomClass = faker.helpers.arrayElement(classes);
  //   await db.class.update({
  //     where: { id: randomClass.id },
  //     data: {
  //       users: {
  //         connect: { id: user.id },
  //       },
  //     },
  //   });
  // }

  // Generate Random Packages for Classes
  // const packages = [];
  // // for (const classItem of classes) {
  // for (let i = 0; i < 5; i++) {
  //   const TOstart = faker.date.recent({ days: 7 });
  //   const TOend = faker.date.soon({ refDate: TOstart, days: 7 });
  //   const newPackage = await db.package.create({
  //     data: {
  //       name: "Try Out #" + (i + 1),
  //       type: "tryout",
  //       TOstart,
  //       TOend,
  //       // classId: classItem.id,
  //     },
  //   });
  //   packages.push(newPackage);
  // }
  // }

  // const generateQuestionAnswer = async (
  //   subtestId: string,
  //   packageId?: string,
  // ) => {
  //   // Generate Random Questions and Answers for Subtest
  //   for (let j = 0; j < 5; j++) {
  //     const question = await db.question.create({
  //       data: {
  //         index: j + 1,
  //         content: faker.word.words({ count: { min: 5, max: 50 } }),
  //         // imageUrl: faker.image.url(),
  //         type: faker.helpers.arrayElement(["essay", "mulChoice", "mulAnswer"]),
  //         score: faker.number.int({ min: 5, max: 50 }),
  //         subtestId: subtestId,
  //       },
  //     });

  //     // Generate Answers for Question
  //     // Generate Answers for Question based on type
  //     if (question.type === "essay") {
  //       await db.answer.create({
  //         data: {
  //           index: 0,
  //           content: faker.word.words({ count: { min: 5, max: 20 } }),
  //           questionId: question.id,
  //           isCorrect: true,
  //         },
  //       });
  //     } else if (question.type === "mulChoice") {
  //       // Multiple choice: exactly one correct answer
  //       const answers = await Promise.all(
  //         Array.from({ length: 5 }).map((_, index) =>
  //           db.answer.create({
  //             data: {
  //               index: index,
  //               content: faker.word.words({ count: { min: 1, max: 20 } }),
  //               questionId: question.id,
  //               isCorrect: index === 0, // Only first answer is correct
  //             },
  //           }),
  //         ),
  //       );
  //     } else if (question.type === "mulAnswer") {
  //       // Multiple answer: 1 to 5 answers can be correct
  //       const numCorrect = faker.number.int({ min: 1, max: 5 });
  //       const correctIndices = faker.helpers
  //         .shuffle([0, 1, 2, 3, 4])
  //         .slice(0, numCorrect) as (0 | 1 | 2 | 3 | 4)[];

  //       const answers = await Promise.all(
  //         Array.from({ length: 5 }).map((_, index) =>
  //           db.answer.create({
  //             data: {
  //               index: index,
  //               content: faker.word.words({ count: { min: 1, max: 20 } }),
  //               questionId: question.id,
  //               isCorrect: correctIndices.includes(index as 0 | 1 | 2 | 3 | 4),
  //             },
  //           }),
  //         ),
  //       );
  //     }
  //   }
  // };

  // Generate Random Subtests for Packages
  // for (const packageItem of packages) {
  //   for (let i = 0; i < 3; i++) {
  //     const subtest = await db.subtest.create({
  //       data: {
  //         type: faker.helpers.arrayElement([
  //           "pu",
  //           "ppu",
  //           "pbm",
  //           "pk",
  //           "pm",
  //           "lbe",
  //           "lbi",
  //         ]),
  //         duration: faker.number.int({ min: 10, max: 60, multipleOf: 5 }),
  //         packageId: packageItem.id,
  //       },
  //     });
  //     await generateQuestionAnswer(subtest.id, packageItem.id);
  //   }
  // }

  // Generate Random Videos
  const rekamanVideosData = [
    {
      title: "Video Materi #1",
      description: "Video Materi #1",
      url: "https://youtu.be/HofUDfwfUY8",
      type: "rekaman",
      createdAt: new Date().toISOString(),
    },
    {
      title: "Video Materi #2",
      description: "Video Materi #2",
      url: "https://youtu.be/9JbAp__yGhU",
      type: "rekaman",
      createdAt: new Date().toISOString(),
    },
  ];

  // Add 20 more videos with type: materi
  // const materiVideosData = Array.from({ length: 20 }).map(() => ({
  //   title: faker.word.words(),
  //   description: faker.lorem.sentence(),
  //   url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  //   type: "materi",
  //   createdAt: new Date().toISOString(),
  // }));

  const videosData = [...rekamanVideosData];
  // const videosData = [...rekamanVideosData, ...materiVideosData];

  if (videosData.length === 0) {
    console.log("No videos fetched from YouTube.");
    return;
  }

  await db.video.createMany({
    data: videosData.map((video) => ({
      title: video.title,
      description: video.description,
      url: video.url,
      type: video.type as VideoType,
      duration: 600,
    })),
    skipDuplicates: true,
  });
  console.log(`Successfully created ${videosData.length} videos.`);

  // const videos = await db.video.findMany();

  // Generate Random Subjects, materials, and topics
  const subjects = await Promise.all(
    SUBJECT_CATEGORIES.flatMap((category) =>
      category.subjects.map((subject) =>
        db.subject.create({
          data: {
            id: subject.id,
            name: subject.title,
            type: category.type as any,
            mode: category.type === "ubtk" ? "utbk" : "tka",
          },
        }),
      ),
    ),
  );

  // const materials = await Promise.all(
  //   subjects.flatMap((subject) =>
  //     Array.from({ length: 3 }).map((_, index) =>
  //       db.material.create({
  //         data: {
  //           index: index + 1,
  //           name: faker.word.words(),
  //           subjectId: subject.id,
  //         },
  //       }),
  //     ),
  //   ),
  // );

  // Create a copy of videos and packages arrays to track usage
  // const availableVideos = [...videos];
  // const availablePackages = [...packages];

  // const topics = [];

  // // Calculate maximum topics we can create (limited by the smaller of videos or packages)
  // const maxTopics = Math.min(availableVideos.length, availablePackages.length);
  // let topicsCreated = 0;

  // for (const material of materials) {
  //   if (topicsCreated >= maxTopics) break;

  //   const topicsForThisChapter = Math.min(
  //     2,
  //     maxTopics - topicsCreated,
  //     availableVideos.length,
  //   );

  //   for (let i = 0; i < topicsForThisChapter; i++) {
  //     if (availableVideos.length === 0 || availablePackages.length === 0) break;

  //     // Remove video and package from available lists to ensure uniqueness
  //     const videoIndex = faker.number.int({
  //       min: 0,
  //       max: availableVideos.length - 1,
  //     });

  //     const selectedVideo = availableVideos.splice(videoIndex, 1)[0];

  //     const subtest = await db.subtest.create({
  //       data: {
  //         type: "materi",
  //         duration: faker.number.int({ min: 10, max: 60, multipleOf: 5 }),
  //       },
  //     });
  //     await generateQuestionAnswer(subtest.id);

  //     const topic = await db.topic.create({
  //       data: {
  //         index: i + 1,
  //         name: faker.word.words(),
  //         materialId: material.id,
  //         videoId: selectedVideo.id,
  //         subtestId: subtest.id,
  //       },
  //     });
  //     topics.push(topic);
  //     topicsCreated++;
  //   }
  // }

  // // Generate Random Folders
  // const folders = await Promise.all(
  //   Array.from({ length: 5 }).map(() =>
  //     db.folder.create({
  //       data: {
  //         name: faker.word.words(),
  //         description: faker.lorem.sentence(),
  //       },
  //     }),
  //   ),
  // );

  // // Generate Random Files for Each Folder
  // for (const folder of folders) {
  //   await Promise.all(
  //     Array.from({ length: 10 }).map(() =>
  //       db.file.create({
  //         data: {
  //           title: faker.word.words(),
  //           description: faker.lorem.sentence(),
  //           url: faker.helpers.arrayElement([
  //             `https://picsum.photos/200/300?random=${faker.number.int()}`,
  //             `https://via.placeholder.com/150?text=${faker.lorem.word()}`,
  //           ]),
  //           folderId: folder.id,
  //         },
  //       }),
  //     ),
  //   );
  // }

  // console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
