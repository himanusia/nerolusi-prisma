import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Subtest, QuestionType, Type, SubtestType } from "@prisma/client";

export const packageRouter = createTRPCRouter({
  // Get One Package with Questions and Answers
  getOnePackage: protectedProcedure
    .input(
      z.object({
        packageId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: input.packageId },
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

      return packageData;
    }),

  // Get All Packages
  getAllPackages: protectedProcedure.query(async ({ ctx }) => {
    const packages = await ctx.db.package.findMany({
      orderBy: { id: "desc" },
    });
    return packages ?? null;
  }),

  // Create Package
  createPackage: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.nativeEnum(Type),
        classId: z.number().positive("Class ID must be a positive number"),
        TOstart: z.string().optional(),
        TOend: z.string().optional(),
        subtests: z.array(
          z.object({
            type: z.nativeEnum(SubtestType),
            duration: z.string(),
            questions: z.array(
              z.object({
                index: z.number().positive("Index must be a positive number"),
                content: z.string().min(1, "Content is required"),
                imageUrl: z.string().optional(),
                type: z.nativeEnum(QuestionType),
                score: z
                  .number()
                  .min(0, "Score must be non-negative")
                  .default(0),
                explanation: z.string().optional(),
                answers: z.array(
                  z.object({
                    index: z
                      .number()
                      .positive("Index must be a positive number"),
                    content: z.string().min(1, "Answer content is required"),
                  }),
                ),
                correctAnswerChoice: z.number().optional(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { subtests, ...packageData } = input;

        // Normalize date fields
        const { classId, ...restPackageData } = packageData;
        const normalizedPackageData = {
          ...restPackageData,
          name: packageData.name,
          type: packageData.type,
          TOstart: packageData.TOstart ? new Date(packageData.TOstart) : null,
          TOend: packageData.TOend ? new Date(packageData.TOend) : null,
        };

        // Create Package without packageId in the input
        const createdPackage = await ctx.db.package.create({
          data: {
            ...normalizedPackageData,
            class: {
              connect: { id: classId },
            },
          },
        });

        // Create Subtests, Questions, and Answers using created packageId
        for (const subtest of subtests) {
          await ctx.db.subtest.create({
            data: {
              type: subtest.type,
              duration: subtest.duration,
              packageId: createdPackage.id, // Link the subtest to the package
              questions: {
                create: subtest.questions.map((question) => ({
                  index: question.index,
                  content: question.content,
                  imageUrl: question.imageUrl,
                  type: question.type,
                  score: question.score,
                  explanation: question.explanation,
                  correctAnswerChoice: question.correctAnswerChoice,
                  packageId: createdPackage.id, // Link the question to the package
                  answers: {
                    create: question.answers.map((answer) => ({
                      index: answer.index,
                      content: answer.content,
                    })),
                  },
                })),
              },
            },
            include: {
              questions: {
                include: {
                  answers: true,
                },
              },
            },
          });
        }

        return createdPackage;
      } catch (error) {
        // Handle the error if it occurs
        if (error instanceof Error) {
          console.error("Error creating package:", error.message);
          throw new Error("Error creating package: " + error.message);
        }
        throw error; // Re-throw if it's not an instance of Error
      }
    }),
});
