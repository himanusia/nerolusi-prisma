import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { SubtestType, QuestionType, Type } from "@prisma/client";

export const questionsRouter = createTRPCRouter({
  getOneQuestions: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const question = await ctx.db.question.findUnique({
        where: { id: input.id },
      });

      return question;
    }),
});
