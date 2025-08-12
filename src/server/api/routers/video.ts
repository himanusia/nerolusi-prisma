import { z } from "zod";
import {
  createTRPCRouter,
  subscriberProcedure,
  teacherProcedure,
  userProcedure,
} from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
  getAllRekamanVideos: subscriberProcedure.query(async ({ ctx }) => {
    const videos = await ctx.db.video.findMany({
      where: { type: "rekaman" },
      orderBy: { createdAt: "desc" },
    });
    return videos;
  }),

  getVideoById: subscriberProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const video = await ctx.db.video.findUnique({
        where: { id },
      });

      if (!video) {
        throw new Error("Video not found");
      }

      if (video.type === "materi" && !ctx.session.user.enrolledTka) {
        throw new Error("You must be enrolled in TKA to access this video.");
      }

      return video;
    }),

  addVideo: teacherProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        url: z.string().url("Invalid URL format"),
        type: z.enum(["materi", "rekaman"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, description, url, type } = input;

      const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!regex.test(url)) {
        throw new Error("URL harus merupakan URL YouTube yang valid.");
      }

      return await ctx.db.video.create({
        data: {
          title,
          description,
          type,
          url,
          duration: 600,
        },
      });
    }),

  deleteVideo: teacherProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      await ctx.db.video.delete({
        where: { id },
      });

      return { success: true };
    }),

  editVideo: teacherProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        url: z.string().url("Invalid URL format"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, description, url } = input;

      const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!regex.test(url)) {
        throw new Error("URL harus merupakan URL YouTube yang valid.");
      }

      return await ctx.db.video.update({
        where: { id },
        data: { title, description, url },
      });
    }),
});
