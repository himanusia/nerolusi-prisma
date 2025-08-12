import { z } from "zod";
import { createTRPCRouter, tkaProcedure } from "../trpc";

export interface Video {
  id: string;
  topicId: number;
  index: number;
  title: string;
  duration: number;
  isCompleted: boolean;
  isLocked?: boolean;
  hasQuiz?: boolean;
  isDrillCompleted?: boolean;
  drillId?: string;
}

export interface MaterialSection {
  id: number;
  index: number;
  title: string;
  subtitle?: string;
  videoCount: number;
  totalDuration: string;
  videos: Video[];
  isExpanded: boolean;
}

export const materiRouter = createTRPCRouter({
  getSubjectsMaterial: tkaProcedure
    .input(
      z.object({
        subjectName: z.string(),
      }),
    )
    .query(async ({ ctx, input }): Promise<MaterialSection[]> => {
      const materials = await ctx.db.material.findMany({
        where: {
          subject: {
            name: input.subjectName,
          },
        },
        include: {
          topics: {
            include: {
              video: true,
            },
          },
        },
      });

      const userTopicProgress = await ctx.db.userMateriProgress.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });

      let total = 0;

      const materialSections: MaterialSection[] = materials
        .map((material) => {
          const videos: Video[] = material.topics.map((topic) => {
            total += topic.video.duration;
            const userProgress = userTopicProgress.find(
              (progress) => progress.topicId === topic.id,
            );
            return {
              id: topic.video.id,
              topicId: topic.id,
              index: topic.index,
              title: topic.video.title,
              duration: topic.video.duration,
              isCompleted: !!userProgress,
              isLocked: false,
              hasQuiz: true,
              isDrillCompleted: userProgress?.isDrillCompleted ?? false,
              drillId: topic.subtestId,
            };
          });

          const totalMinutes = Math.floor(total / 60);
          const hours = Math.floor(totalMinutes / 60);
          const minutes = totalMinutes % 60;
          const totalDuration =
            hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

          return {
            id: material.id,
            index: material.index,
            title: material.name,
            subtitle: undefined,
            videoCount: videos.length,
            totalDuration,
            videos: videos.sort((a, b) => a.index - b.index),
            isExpanded: false, // Default to collapsed
          };
        })
        .sort((a, b) => a.index - b.index);

      return materialSections;
    }),

  updateUserMaterialProgressAndSubmit: tkaProcedure
    .input(
      z.object({
        sessionId: z.string(),
        topicId: z.number(),
        isDrillCompleted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        const { sessionId, topicId, isDrillCompleted } = input;

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

        // Check if the user has already completed this topic
        const existingProgress = await tx.userMateriProgress.findFirst({
          where: {
            userId: ctx.session.user.id,
            topicId,
          },
        });

        if (existingProgress && isDrillCompleted !== undefined) {
          // Update existing progress
          await tx.userMateriProgress.update({
            where: { id: existingProgress.id },
            data: { isDrillCompleted },
          });
        } else {
          // Create new progress entry
          await tx.userMateriProgress.create({
            data: {
              userId: ctx.session.user.id,
              topicId,
              isDrillCompleted: isDrillCompleted ?? false,
            },
          });
        }
      });
    }),

  updateUserMaterialProgress: tkaProcedure
    .input(
      z.object({
        topicId: z.number(),
        isDrillCompleted: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { topicId, isDrillCompleted } = input;

      // Check if the user has already completed this topic
      const existingProgress = await ctx.db.userMateriProgress.findFirst({
        where: {
          userId: ctx.session.user.id,
          topicId,
        },
      });

      if (existingProgress && isDrillCompleted !== undefined) {
        // Update existing progress
        await ctx.db.userMateriProgress.update({
          where: { id: existingProgress.id },
          data: { isDrillCompleted },
        });
      } else {
        // Create new progress entry
        await ctx.db.userMateriProgress.create({
          data: {
            userId: ctx.session.user.id,
            topicId,
            isDrillCompleted: isDrillCompleted ?? false,
          },
        });
      }
    }),
});
