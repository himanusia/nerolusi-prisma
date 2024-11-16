import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Subtest, QuestionType, Type } from "@prisma/client";

const subtestEnum = z.nativeEnum(Subtest);
const questionTypeEnum = z.nativeEnum(QuestionType);
const TypeEnum = z.nativeEnum(Type);

export const questionsRouter = createTRPCRouter({
  getOneQuestions: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.id },
      });

      return question;
    }),

  getAllQuestions: protectedProcedure.query(async ({ ctx }) => {
    const questions = await ctx.db.question.findMany();
    return questions ?? null;
  }),

  addQuestion: protectedProcedure
    .input(
      z.object({
        index: z.number().int().nonnegative(),
        content: z.string(),
        imageUrl: z.string().optional().nullable(),
        subtest: subtestEnum,
        type: questionTypeEnum,
        score: z.number().optional().nullable(),
        correctAnswerId: z.string().optional().nullable(),
        explanation: z.string().optional().nullable(),
        packageId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        index,
        content,
        imageUrl,
        subtest,
        type,
        score,
        correctAnswerId,
        explanation,
        packageId,
      } = input;
      await ctx.db.question.create({
        data: {
          index,
          content,
          imageUrl,
          subtest,
          type,
          score: score ?? 0,
          correctAnswerId,
          explanation: explanation ?? "",
          packageId,
        },
      });
    }),

  addQuestionWithPackage: protectedProcedure
    .input(
      z.object({
        index: z.number().int().nonnegative(),
        content: z.string(),
        imageUrl: z.string().optional().nullable(),
        subtest: subtestEnum,
        type: questionTypeEnum,
        score: z.number().optional().nullable(),
        correctAnswerId: z.string().optional().nullable(),
        explanation: z.string().optional().nullable(),
        packageId: z.number().int(),
        id: z.number(),
        name: z.string().min(1, "Package name is required"),
        pkgType: TypeEnum,
        start: z.date().optional(),
        end: z.date().optional(),
        duration: z.string().optional(),
        classId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        index,
        content,
        imageUrl,
        subtest,
        type,
        score,
        correctAnswerId,
        explanation,
        id,
        name,
        pkgType,
        start,
        end,
        duration,
        classId,
      } = input;

      await ctx.db.$transaction(async (transaction) => {
        const newPackage = await transaction.package.create({
          data: {
            id,
            name,
            type: pkgType,
            TOstart: start ?? null,
            TOend: end ?? null,
            TOduration: duration ? duration : null,
            classId: classId,
          },
        });

        await transaction.question.create({
          data: {
            index,
            content,
            imageUrl,
            subtest,
            type,
            score: score ?? 0,
            correctAnswerId,
            explanation: explanation ?? "",
            packageId: newPackage.id,
          },
        });
      });
    }),

  updateQuestion: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        index: z.number().int().nonnegative(),
        content: z.string().min(1, "Content is required"),
        imageUrl: z.string().optional(),
        subtest: subtestEnum,
        type: questionTypeEnum,
        score: z.number().optional(),
        correctAnswerId: z.string().optional(),
        explanation: z.string().optional(),
        packageId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        index,
        content,
        imageUrl,
        subtest,
        type,
        score,
        correctAnswerId,
        explanation,
        packageId,
      } = input;
      await ctx.db.question.update({
        where: { id },
        data: {
          index,
          content,
          imageUrl,
          subtest,
          type,
          score: score ?? 0,
          correctAnswerId,
          explanation: explanation ?? "",
          packageId,
        },
      });
    }),

  updateCorrectAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        correctAnswerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.question.update({
        where: { id: input.questionId },
        data: { correctAnswerId: input.correctAnswerId },
      });
    }),
});
