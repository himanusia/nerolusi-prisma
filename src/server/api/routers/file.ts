import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const fileRouter = createTRPCRouter({
  getAllFolders: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.folder.findMany();
  }),

  getAllFiles: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.file.findMany();
  }),

  getFilesByFolderId: protectedProcedure
    .input(
      z.object({
        folderId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.file.findMany({
        where: {
          folderId: input.folderId,
        },
      });
    }),

  // uploadFile: protectedProcedure
  //   .input(
  //     z.object({
  //       title: z.string(),
  //       description: z.string().optional(),
  //       url: z.string().url(),
  //     }),
  //   )
  //   .mutation(async ({ ctx, input }) => {
  //     const result = await ctx.db.file.create({
  //       data: {
  //         title: input.title,
  //         description: input.description,
  //         url: input.url,
  //       },
  //     });

  //     return result;
  //   }),
});
