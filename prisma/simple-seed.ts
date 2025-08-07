import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Creating simple drill packages...");

  // Create a simple class for testing
  const testClass = await db.class.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Class 12 UTBK",
    },
  });

  // Create drill packages for each video in each subject
  const subjects = [
    { 
      type: "pk", 
      subjectName: "Matematika Wajib", 
      videos: [
        { id: 1, name: "Drill Teori Bilangan" },
        { id: 2, name: "Drill Operasi Bilangan" },
        { id: 3, name: "Drill Aritmatika Sosial" },
        { id: 4, name: "Drill Konsep Aljabar" },
      ]
    },
    { 
      type: "lbi", 
      subjectName: "Bahasa Indonesia", 
      videos: [
        { id: 5, name: "Drill Sistem Persamaan Linear" },
        { id: 6, name: "Drill Program Linear" },
      ]
    },
    { 
      type: "lbe", 
      subjectName: "Bahasa Inggris", 
      videos: [
        { id: 7, name: "Drill Konsep Himpunan" },
        { id: 8, name: "Drill Operasi Himpunan" },
      ]
    },
    { 
      type: "pm", 
      subjectName: "Fisika", 
      videos: [
        { id: 9, name: "Drill Fungsi Linear" },
        { id: 10, name: "Drill Fungsi Kuadrat" },
      ]
    },
  ];

  for (const subject of subjects) {
    for (const video of subject.videos) {
      const drillPackage = await db.package.create({
        data: {
          name: `${video.name} - ${subject.subjectName}`,
          type: "drill",
          classId: testClass.id,
          subtests: {
            create: {
              type: subject.type as any,
              duration: 15, // 15 minutes per video drill
              questions: {
                create: Array.from({ length: 5 }).map((_, index) => ({
                  index: index + 1,
                  content: `Soal ${index + 1} untuk ${video.name} dalam mata pelajaran ${subject.subjectName}. Pilih jawaban yang paling tepat!`,
                  type: "mulChoice",
                  score: 20, // 100 total score / 5 questions
                  packageId: 0, // Will be set by Prisma
                  answers: {
                    create: [
                      { index: 1, content: "Pilihan A - Jawaban pertama" },
                      { index: 2, content: "Pilihan B - Jawaban kedua" },
                      { index: 3, content: "Pilihan C - Jawaban ketiga (benar)" },
                      { index: 4, content: "Pilihan D - Jawaban keempat" },
                    ],
                  },
                  correctAnswerChoice: 3,
                })),
              },
            },
          },
        },
        include: {
          subtests: {
            include: {
              questions: {
                include: {
                  answers: true,
                },
              },
            },
          },
        },
      });

      // Update questions with correct packageId
      await db.question.updateMany({
        where: {
          subtestId: drillPackage.subtests[0].id,
        },
        data: {
          packageId: drillPackage.id,
        },
      });

      console.log(`Created drill package: ${video.name} - ${subject.subjectName} (ID: ${drillPackage.id}) for Video ${video.id}`);
    }
  }

  console.log("Simple drill packages created successfully!");
}

main()
  .catch((e) => {
    console.error("Error while creating drill packages:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
