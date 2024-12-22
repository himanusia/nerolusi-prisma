import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const videoRouter = createTRPCRouter({
  getAllVideos: protectedProcedure.query(async ({ ctx }) => {
    const videos = await ctx.db.video.findMany();
    return videos ?? null;
  }),

  addVideo: protectedProcedure
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

      const newVideo = await ctx.db.video.create({
        data: {
          title,
          description,
          url,
        },
      });

      return newVideo;
    }),
});
