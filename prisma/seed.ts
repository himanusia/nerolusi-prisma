import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding data...");

  // Generate Random Users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          name: faker.name.fullName(),
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

  // Generate Random Videos
  await prisma.video.createMany({
    data: Array.from({ length: 10 }).map(() => ({
      title: faker.lorem.words(3),
      description: faker.lorem.sentence(),
      url: faker.internet.url(),
    })),
  });

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
