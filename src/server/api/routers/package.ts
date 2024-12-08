import { Package, Prisma } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

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
        type: z.enum(["tryout", "drill"]),
        classId: z.number().positive("Class ID must be a positive number"),
        TOstart: z.string().optional(),
        TOend: z.string().optional(),
        subtests: z.array(
          z.object({
            type: z.enum(["pu", "ppu", "pbm", "pk", "lb", "pm"]),
            duration: z.string(),
            questions: z.array(
              z.object({
                index: z.number().positive("Index must be a positive number"),
                content: z.string().min(1, "Content is required"),
                imageUrl: z.string().optional(),
                subtestType: z.enum(["pu", "ppu", "pbm", "pk", "lb", "pm"]),
                type: z.enum(["essay", "mulChoice"]),
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
        const normalizedPackageData = {
          ...packageData,
          TOstart: packageData.TOstart ? new Date(packageData.TOstart) : null,
          TOend: packageData.TOend ? new Date(packageData.TOend) : null,
        };

        // Create Package without packageId in the input
        const createdPackage = await ctx.db.package.create({
          data: normalizedPackageData,
        });

        // Create Subtests, Questions, and Answers using created packageId
        for (const subtest of subtests) {
          const createdSubtest = await ctx.db.subtest.create({
            data: {
              type: subtest.type,
              duration: subtest.duration,
              packageId: createdPackage.id, // Link the subtest to the package
              questions: {
                create: subtest.questions.map((question) => ({
                  index: question.index,
                  content: question.content,
                  imageUrl: question.imageUrl,
                  subtestType: question.subtestType,
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
