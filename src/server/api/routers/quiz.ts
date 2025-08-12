import { SubtestType } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  teacherProcedure,
  userProcedure,
} from "~/server/api/trpc";

export const quizRouter = createTRPCRouter({
  getAnnouncement: userProcedure.query(async ({ ctx }) => {
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

  getQuizSessionResult: userProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = ctx.db.quizSession.findUnique({
        where: {
          id: input.sessionId,
        },
        include: {
          subtest: {
            include: {
              topics: {
                include: {
                  video: true,
                  material: {
                    include: {
                      subject: true,
                    },
                  },
                },
              },
              package: true,
            },
          },
        },
      });
      return session;
    }),

  getPackageWithSubtest: userProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: {
          id: input.id,
        },
        omit: {
          id: true,
          classId: true,
        },
        include: {
          subtests: {
            include: {
              _count: { select: { questions: true } },
              quizSession: {
                where: {
                  userId: ctx.session.user?.id,
                },
                select: {
                  endTime: true,
                  numAnswered: true,
                  numCorrect: true,
                  numQuestion: true,
                  score: true,
                  package: { select: { TOend: true } },
                  userAnswers: {
                    select: {
                      question: {
                        select: {
                          score: true,
                          answers: {
                            select: {
                              id: true,
                              content: true,
                              isCorrect: true,
                            },
                          },
                        },
                      },
                      answerChoices: true,
                      essayAnswer: true,
                    },
                  },
                },
                orderBy: {
                  endTime: "desc",
                },
                take: 1,
              },
            },
          },
        },
      });

      if (!packageData) {
        throw new Error("Package not found");
      }

      return packageData;
    }),

  getSession: userProcedure
    .input(
      z.object({
        userId: z.string(),
        subtestId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.quizSession.findFirst({
        where: {
          userId: input.userId,
          subtestId: input.subtestId,
        },
      });
    }),

  createSession: userProcedure
    .input(
      z.object({
        userId: z.string(),
        packageId: z.string().optional(),
        subtestId: z.string(),
        duration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.quizSession.create({
        data: {
          userId: input.userId,
          packageId: input.packageId ?? undefined,
          subtestId: input.subtestId,
          duration: input.duration,
          endTime: new Date(new Date().getTime() + input.duration * 60 * 1000),
        },
      });
    }),

  getQuestionsBySubtest: userProcedure
    .input(z.object({ subtestId: z.string(), userId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.quizSession.findFirst({
        where: {
          subtestId: input.subtestId,
          userId:
            ctx.session.user.role === "admin"
              ? (input.userId ?? ctx.session.user?.id)
              : ctx.session.user?.id,
        },
        select: { endTime: true, package: { select: { TOend: true } } },
      });

      if (!session) {
        return null;
      }

      // Check if this specific session has ended
      const sessionEnded = new Date(session.endTime) < new Date();

      if (sessionEnded) {
        // Session completed - show answers and explanations for review
        return await ctx.db.question.findMany({
          where: { subtestId: input.subtestId },
          orderBy: { index: "asc" },
          include: {
            answers: {
              orderBy: { index: "asc" },
            },
          },
        });
      } else {
        // Session still active - hide answers and explanations
        return await ctx.db.question
          .findMany({
            where: { subtestId: input.subtestId },
            orderBy: { index: "asc" },
            include: {
              answers: {
                orderBy: { index: "asc" },
                omit: {
                  isCorrect: true,
                },
              },
            },
          })
          .then((questions) =>
            questions.map((question) => ({
              ...question,
              explanation: null,
              score: null,
            })),
          );
      }
    }),

  getSessionDetails: userProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.quizSession.findUnique({
        where: { id: input.sessionId },
        include: {
          subtest: {
            include: {
              topics: true,
            },
          },
          package: { select: { id: true, type: true, TOend: true } },
          userAnswers: {
            where: { quizSessionId: input.sessionId },
            include: {
              answerChoices: {
                select: {
                  answerId: true,
                },
              },
            },
          },
        },
      });

      if (
        !session ||
        (session.userId !== ctx.session.user?.id &&
          ctx.session.user?.role !== "admin")
      ) {
        return null;
      }

      return session;
    }),

  saveAnswer: userProcedure
    .input(
      z.object({
        answerChoices: z.array(z.number()).nullable(),
        essayAnswer: z.string().nullable(),
        questionId: z.number(),
        userId: z.string(),
        quizSessionId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { answerChoices, essayAnswer, questionId, userId, quizSessionId } =
        input;

      if (answerChoices === null && essayAnswer === null) {
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
          essayAnswer,
        },
        create: {
          essayAnswer,
          questionId,
          userId,
          quizSessionId,
        },
      });

      await ctx.db.userAnswerChoice.deleteMany({
        where: {
          userAnswerId: userAnswer.id,
        },
      });

      if (answerChoices == null) return userAnswer;
      console.log("Saving user answer choices:", answerChoices);
      const userAnswerChoices = await ctx.db.userAnswerChoice.createMany({
        data: answerChoices
          .filter((choice) => choice !== null)
          .map((choice) => ({
            userAnswerId: userAnswer.id,
            answerId: choice,
          })),
      });

      return userAnswer;
    }),

  submitQuiz: userProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        await tx.quizSession.update({
          where: { id: input.sessionId },
          data: {
            endTime: new Date().toISOString(),
          },
        });

        const quizSession = await tx.quizSession.findUnique({
          where: {
            id: input.sessionId,
          },
          include: {
            subtest: {
              include: {
                questions: {
                  include: {
                    answers: true,
                  },
                },
              },
            },
            userAnswers: {
              include: {
                answerChoices: {
                  select: {
                    answerId: true,
                  },
                },
                question: {
                  select: {
                    score: true,
                    answers: {
                      select: {
                        id: true,
                        content: true,
                        isCorrect: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!quizSession) {
          throw new Error("Quiz session not found");
        }

        let totalCorrect = 0;
        let totalScore = 0;

        // Calculate total correct answers and total score
        quizSession.userAnswers.forEach((userAnswer) => {
          // For multiple choice questions
          if (userAnswer.answerChoices.length > 0) {
            const correctAnswerIds = userAnswer.question.answers
              .filter((ans) => ans.isCorrect)
              .map((ans) => ans.id);

            const userAnswerIds = userAnswer.answerChoices.map(
              (choice) => choice.answerId,
            );

            // Check if arrays are equal (same length and same elements)
            const isCorrect =
              correctAnswerIds.length === userAnswerIds.length &&
              correctAnswerIds.every((id) => userAnswerIds.includes(id));

            if (isCorrect) {
              totalCorrect++;
              totalScore += userAnswer.question.score;
            }
          } else if (userAnswer.essayAnswer !== null) {
            // For essay questions
            const correctEssayAnswer = userAnswer.question.answers.find(
              (ans) => ans.isCorrect,
            );

            const isEssayCorrect =
              correctEssayAnswer &&
              userAnswer.essayAnswer.trim().toLowerCase() ===
                correctEssayAnswer.content.trim().toLowerCase();

            if (isEssayCorrect) {
              totalCorrect++;
              totalScore += userAnswer.question.score;
            }
          }
        });

        await tx.quizSession.update({
          where: { id: input.sessionId },
          data: {
            score: totalScore,
            numQuestion: quizSession.subtest.questions.length,
            numCorrect: totalCorrect,
          },
        });
      });
    }),

  getDrillSubtest: userProcedure
    .input(z.object({ subtest: z.nativeEnum(SubtestType) }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      return await ctx.db.subtest
        .findMany({
          where: {
            package: {
              type: "drill",
            },
            type: input.subtest,
          },
          select: {
            id: true,
            duration: true,
            _count: {
              select: {
                questions: true,
              },
            },
            package: {
              select: {
                id: true,
                name: true,
              },
            },
            questions: {
              select: {
                id: true,
                userAnswers: {
                  where: {
                    userId: userId,
                  },
                  select: {
                    answerChoices: true,
                    essayAnswer: true,
                  },
                },
                answers: true,
              },
            },
            quizSession: {
              where: {
                userId: userId,
              },
              select: {
                id: true,
              },
            },
          },
        })
        .then((subtests) => {
          return subtests.map((subtest) => {
            let correctCount = 0;

            subtest.questions.forEach((question) => {
              question.userAnswers.forEach((userAnswer) => {
                // For multiple choice questions
                if (userAnswer.answerChoices.length > 0) {
                  const correctAnswerIds = question.answers
                    .filter((ans) => ans.isCorrect)
                    .map((ans) => ans.id);

                  const userAnswerIds = userAnswer.answerChoices.map(
                    (choice) => choice.answerId,
                  );

                  // Check if arrays are equal (same length and same elements)
                  const isCorrect =
                    correctAnswerIds.length === userAnswerIds.length &&
                    correctAnswerIds.every((id) => userAnswerIds.includes(id));

                  if (isCorrect) correctCount++;
                } else if (userAnswer.essayAnswer !== null) {
                  const correctEssayAnswer = question.answers.find(
                    (ans) => ans.isCorrect,
                  );
                  if (
                    correctEssayAnswer &&
                    userAnswer.essayAnswer.trim().toLowerCase() ===
                      correctEssayAnswer.content.trim().toLowerCase()
                  ) {
                    correctCount++;
                  }
                }
              });
            });

            return {
              ...subtest,
              hasQuizSession: subtest.quizSession.length > 0,
              _count: {
                questions: subtest._count.questions,
                correct: correctCount,
              },
            };
          });
        });
    }),

  getDrill: userProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    return await ctx.db.subtest
      .findMany({
        where: {
          package: {
            type: "drill",
          },
          quizSession: {
            some: {
              userId: userId,
            },
          },
        },
        select: {
          id: true,
          duration: true,
          type: true,
          _count: {
            select: {
              questions: true,
            },
          },
          package: {
            select: {
              id: true,
              name: true,
            },
          },
          questions: {
            select: {
              id: true,
              userAnswers: {
                where: {
                  userId: userId,
                },
                select: {
                  answerChoices: {
                    select: {
                      answerId: true,
                    },
                  },
                  essayAnswer: true,
                },
              },
              answers: {
                select: {
                  id: true,
                  content: true,
                  isCorrect: true,
                },
              },
            },
          },
          quizSession: {
            where: {
              userId: userId,
            },
            select: {
              id: true,
            },
          },
        },
      })
      .then((subtests) => {
        return subtests.map((subtest) => {
          let correctCount = 0;

          subtest.questions.forEach((question) => {
            question.userAnswers.forEach((userAnswer) => {
              // For multiple choice questions
              if (userAnswer.answerChoices.length > 0) {
                const correctAnswerIds = question.answers
                  .filter((ans) => ans.isCorrect)
                  .map((ans) => ans.id);

                const userAnswerIds = userAnswer.answerChoices.map(
                  (choice) => choice.answerId,
                );

                // Check if arrays are equal (same length and same elements)
                const isCorrect =
                  correctAnswerIds.length === userAnswerIds.length &&
                  correctAnswerIds.every((id) => userAnswerIds.includes(id));

                if (isCorrect) correctCount++;
              } else if (userAnswer.essayAnswer !== null) {
                const correctEssayAnswer = question.answers.find(
                  (ans) => ans.isCorrect,
                );
                if (
                  correctEssayAnswer &&
                  userAnswer.essayAnswer.trim().toLowerCase() ===
                    correctEssayAnswer.content.trim().toLowerCase()
                ) {
                  correctCount++;
                }
              }
            });
          });

          const transformedSubtest = {
            ...subtest,
            sessionId: subtest.quizSession[0].id,
            _count: {
              questions: subtest._count.questions,
              correct: correctCount,
            },
          };
          delete transformedSubtest.questions;
          delete transformedSubtest.quizSession;
          return transformedSubtest;
        });
      });
  }),

  getTryout: userProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const tryouts = await ctx.db.package
      .findMany({
        where: {
          type: "tryout",
          TOend: {
            lte: new Date(),
          },
          quizSession: {
            some: {
              userId: userId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          TOstart: true,
          TOend: true,
          quizSession: {
            where: {
              userId: userId,
            },
            select: {
              id: true,
              userAnswers: {
                select: {
                  questionId: true,
                  answerChoices: {
                    select: {
                      answerId: true,
                    },
                  },
                  essayAnswer: true,
                  question: {
                    select: {
                      id: true,
                      score: true,
                      answers: {
                        select: {
                          id: true,
                          content: true,
                          isCorrect: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          subtests: {
            select: {
              id: true,
              type: true,
              questions: {
                select: {
                  id: true,
                  score: true,
                  type: true,
                  answers: {
                    select: {
                      id: true,
                      content: true,
                      isCorrect: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
      .then((packages) => {
        return packages.map((pkg) => {
          const subtests = pkg.subtests.map((subtest) => {
            let correctCount = 0;
            let totalScore = 0;
            let totalQuestions = 0;

            subtest.questions.forEach((question) => {
              const userAnswersForQuestion = pkg.quizSession.flatMap(
                (session) =>
                  session.userAnswers.filter(
                    (userAnswer) => userAnswer.questionId === question.id,
                  ),
              );

              userAnswersForQuestion.forEach((userAnswer) => {
                totalQuestions++;

                // For multiple choice questions
                if (userAnswer.answerChoices.length > 0) {
                  const correctAnswerIds = question.answers
                    .filter((ans) => ans.isCorrect)
                    .map((ans) => ans.id);

                  const userAnswerIds = userAnswer.answerChoices.map(
                    (choice) => choice.answerId,
                  );

                  // Check if arrays are equal (same length and same elements)
                  const isCorrect =
                    correctAnswerIds.length === userAnswerIds.length &&
                    correctAnswerIds.every((id) => userAnswerIds.includes(id));

                  if (isCorrect) {
                    correctCount++;
                    totalScore += question.score;
                  }
                } else if (userAnswer.essayAnswer !== null) {
                  const correctEssayAnswer = question.answers.find(
                    (ans) => ans.isCorrect,
                  );
                  const isEssayCorrect =
                    correctEssayAnswer &&
                    userAnswer.essayAnswer.trim().toLowerCase() ===
                      correctEssayAnswer.content.trim().toLowerCase();

                  if (isEssayCorrect) {
                    correctCount++;
                    totalScore += question.score;
                  }
                }
              });
            });

            return {
              id: subtest.id,
              name: subtest.type,
              sessionId: pkg.quizSession[0].id,
              correct: correctCount,
              all: totalQuestions,
              score: totalScore,
            };
          });

          const totalCorrect = subtests.reduce(
            (total, subtest) => total + subtest.correct,
            0,
          );
          const totalAll = subtests.reduce(
            (total, subtest) => total + subtest.all,
            0,
          );
          const totalScore = subtests.reduce(
            (total, subtest) => total + subtest.score,
            0,
          );

          return {
            id: pkg.id,
            name: pkg.name,
            correct: totalCorrect,
            all: totalAll,
            score:
              subtests.length > 0
                ? Math.round((totalScore / subtests.length) * 100) / 100
                : 0,
            subtest: subtests,
          };
        });
      });

    return tryouts;
  }),
});
