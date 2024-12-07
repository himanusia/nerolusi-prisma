import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
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
    await prisma.usersToClass.create({
      data: {
        userId: user.id,
        classId: randomClass.id,
      },
    });
  }

  // Generate Random Packages for Classes
  const packages = [];
  for (const classItem of classes) {
    for (let i = 0; i < 2; i++) {
      const newPackage = await prisma.package.create({
        data: {
          name: faker.company.catchPhrase(),
          type: faker.helpers.arrayElement(["tryout", "drill"]),
          TOstart: faker.date.future(),
          TOend: faker.date.future(),
          TOduration: `${faker.number.int({ min: 30, max: 180 })} minutes`,
          classId: classItem.id,
        },
      });
      packages.push(newPackage);
    }
  }

  // Generate Random Questions and Answers
  for (const packageItem of packages) {
    for (let i = 0; i < 5; i++) {
      const question = await prisma.question.create({
        data: {
          index: i + 1,
          content: faker.lorem.sentence(),
          imageUrl: faker.image.url(),
          subtest: faker.helpers.arrayElement([
            "pu",
            "ppu",
            "pbm",
            "pk",
            "lb",
            "pm",
          ]),
          type: faker.helpers.arrayElement(["essay", "mulChoice"]),
          score: faker.number.int({ min: 0, max: 10 }),
          packageId: packageItem.id,
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
        data: { correctAnswerId: correctAnswer.id },
      });
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

  console.log("Seeding completed with random data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
