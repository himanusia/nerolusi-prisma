import { z } from "zod";
import {
  createTRPCRouter,
  teacherProcedure,
  userProcedure,
} from "~/server/api/trpc";

export const quizRouter = createTRPCRouter({
  getAnnouncement: userProcedure.query(async ({ ctx, input }) => {
    return await ctx.db.announcement.findFirst();
  }),

  upsertAnnouncement: teacherProcedure
    .input(
      z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        url: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.announcement.upsert({
        where: { id: 1 },
        update: { content: input.content, title: input.title, url: input.url },
        create: { content: input.content, title: input.title, url: input.url },
      });
    }),

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
          endTime: new Date(new Date().getTime() + input.duration * 60 * 1000),
        },
      });
    }),

  getQuestionsBySubtest: userProcedure
    .input(z.object({ subtestId: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.quizSession.findUnique({
        where: {
          unique_user_subtest: {
            subtestId: input.subtestId,
            userId: ctx.session.user?.id,
          },
        },
        include: { package: { select: { TOend: true } } },
      });

      if (!session) {
        return null;
      } else if (new Date(session.endTime) > new Date()) {
        return await ctx.db.question
          .findMany({
            where: { subtestId: input.subtestId },
            orderBy: { index: "asc" },
            include: {
              answers: true,
            },
          })
          .then((questions) =>
            questions.map((question) => ({
              ...question,
              correctAnswerChoice: question.correctAnswerChoice ?? null,
              explanation: question.explanation ?? null,
              score: question.score ?? null,
            })),
          );
      } else if (new Date(session.package.TOend) < new Date()) {
        return await ctx.db.question.findMany({
          where: { subtestId: input.subtestId },
          orderBy: { index: "asc" },
          include: {
            answers: true,
          },
        });
      }
    }),

  getSessionDetails: userProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.quizSession.findUnique({
        where: { id: parseInt(input.sessionId) },
        include: {
          subtest: true,
          package: { select: { TOend: true } },
          userAnswers: {
            where: { quizSessionId: parseInt(input.sessionId) },
          },
        },
      });

      if (!session || session.userId !== ctx.session.user?.id) {
        return null;
      }

      return session;
    }),

  saveAnswer: userProcedure
    .input(
      z.object({
        answerChoice: z.number().nullable(),
        essayAnswer: z.string().nullable(),
        questionId: z.number(),
        userId: z.string(),
        packageId: z.number(),
        quizSessionId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        answerChoice,
        essayAnswer,
        questionId,
        userId,
        packageId,
        quizSessionId,
      } = input;

      if (answerChoice === null && essayAnswer === null) {
        throw new Error("Either answerChoice or essayAnswer must be provided.");
      }

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
          essayAnswer,
        },
        create: {
          answerChoice,
          essayAnswer,
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
        data: {
          endTime: new Date().toISOString(),
          duration: Math.floor(
            (new Date().getTime() -
              new Date(
                (
                  await ctx.db.quizSession.findUnique({
                    where: { id: input.sessionId },
                    select: { startTime: true },
                  })
                ).startTime,
              ).getTime()) /
              60000,
          ),
        },
      });
    }),
});
