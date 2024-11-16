import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const answerRouter = createTRPCRouter({
  getAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const answers = await ctx.db.answer.findMany({
        where: { questionId: input.questionId },
        orderBy: { index: "asc" },
      });

      return answers ?? null;
    }),

  createAnswer: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        questionId: z.string(),
        content: z.string(),
        index: z.number(),
        isCorrect: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newAnswer = await ctx.db.answer.create({
        data: {
          id: input.id,
          questionId: input.questionId,
          content: input.content,
          index: input.index,
        },
      });

      if (input.isCorrect) {
        await ctx.db.question.update({
          where: { id: input.questionId },
          data: { correctAnswerId: newAnswer.id },
        });
      }

      return newAnswer;
    }),

  updateAnswer: protectedProcedure
    .input(
      z.object({
        answerId: z.string(),
        content: z.string(),
        index: z.number(),
        isCorrect: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.answer.update({
        where: { id: input.answerId },
        data: {
          content: input.content,
          index: input.index,
        },
      });

      if (input.isCorrect) {
        const answer = await ctx.db.answer.findUnique({
          where: { id: input.answerId },
          select: { questionId: true },
        });

        if (answer?.questionId) {
          await ctx.db.question.update({
            where: { id: answer.questionId },
            data: { correctAnswerId: input.answerId },
          });
        }
      }

      return { success: true };
    }),
});
