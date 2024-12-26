import { z } from "zod";
import { createTRPCRouter, userProcedure } from "~/server/api/trpc";

export const quizRouter = createTRPCRouter({
  getPackageWithSubtest: userProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.package.findUnique({
        where: {
          id: input.id,
        },
        include: {
          subtests: {
            include: {
              quizSession: {
                where: {
                  userId: ctx.session.user?.id,
                },
              },
            },
          },
        },
      });
    }),

  getSession: userProcedure
    .input(
      z.object({
        userId: z.string(),
        subtestId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.quizSession.findUnique({
        where: {
          unique_user_subtest: {
            userId: input.userId,
            subtestId: input.subtestId,
          },
        },
      });
    }),

  createSession: userProcedure
    .input(
      z.object({
        userId: z.string(),
        packageId: z.number(),
        subtestId: z.number(),
        duration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.quizSession.create({
        data: {
          userId: input.userId,
          packageId: input.packageId,
          subtestId: input.subtestId,
          duration: input.duration,
        },
      });
    }),

  getQuestionsBySubtest: userProcedure
    .input(z.object({ subtestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const questions = await ctx.db.question.findMany({
        where: { subtestId: input.subtestId },
        orderBy: { index: "asc" },
        omit: {
          correctAnswerChoice: true,
          explanation: true,
          score: true,
        },
        include: {
          answers: true,
        },
      });
      return questions;
    }),

  getQuestionsBySubtestwithExplanation: userProcedure
    .input(z.object({ subtestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const questions = await ctx.db.question.findMany({
        where: { subtestId: input.subtestId },
        orderBy: { index: "asc" },
        include: {
          answers: true,
        },
      });
      return questions;
    }),

  getSessionDetails: userProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.quizSession.findUnique({
        where: { id: parseInt(input.sessionId) },
        include: {
          subtest: true,
          user: true,
          userAnswers: {
            where: { quizSessionId: parseInt(input.sessionId) },
          },
        },
      });
      if (!session) throw new Error("Session not found");
      return session;
    }),

  saveAnswer: userProcedure
    .input(
      z.object({
        answerChoice: z.number(),
        questionId: z.number(),
        userId: z.string(),
        packageId: z.number(),
        quizSessionId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { answerChoice, questionId, userId, packageId, quizSessionId } =
        input;

      const userAnswer = await ctx.db.userAnswer.upsert({
        where: {
          userId_quizSessionId_questionId: {
            userId,
            quizSessionId,
            questionId,
          },
        },
        update: {
          answerChoice,
        },
        create: {
          answerChoice,
          questionId,
          userId,
          packageId,
          quizSessionId,
        },
      });

      return userAnswer;
    }),

  submitQuiz: userProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.quizSession.update({
        where: { id: input.sessionId },
        data: { endTime: new Date().toISOString() },
      });
    }),
});
