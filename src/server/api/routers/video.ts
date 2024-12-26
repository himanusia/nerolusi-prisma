import { z } from "zod";
import {
  createTRPCRouter,
  teacherProcedure,
  userProcedure,
} from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
  getAllVideos: userProcedure.query(async ({ ctx }) => {
    const videos = await ctx.db.video.findMany();
    return videos ?? null;
  }),

  addVideo: teacherProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().optional(),
        url: z.string().url("Invalid URL format"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, description, url } = input;

      const regex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
      if (!regex.test(url)) {
        throw new Error("URL harus merupakan URL YouTube yang valid.");
      }

      return await ctx.db.video.create({
        data: {
          title,
          description,
          url,
        },
      });
    }),

  deleteVideo: teacherProcedure
    .input(
      z.object({
        id: z.number(),
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
        id: z.number(),
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
