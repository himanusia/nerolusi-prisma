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
