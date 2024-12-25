import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  userProcedure,
} from "~/server/api/trpc";

export const fileRouter = createTRPCRouter({
  addFolder: adminProcedure
    .input(
      z.object({
        name: z.string().min(1, "Folder name is required"),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.folder.create({
        data: {
          name: input.name,
        },
      });
    }),

  getAllFolders: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.folder.findMany();
  }),

  editFolder: adminProcedure
  .input(
    z.object({
      id: z.number(),
      name: z.string().min(1, "Folder name is required"),
      description: z.string().optional(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    return await ctx.db.folder.update({
      where: { id: input.id },
      data: {
        name: input.name,
        description: input.description,
      },
    });
  }),

  deleteFolder: adminProcedure
    .input(z.object({ folderId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.folder.delete({
        where: {
          id: input.folderId,
        },
      });
    }),

  getAllFiles: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.file.findMany();
  }),

  deleteFile: adminProcedure
    .input(z.object({ fileId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.file.delete({
        where: {
          id: input.fileId,
        },
      });
    }),

  getFilesByFolderId: userProcedure
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

  // uploadFile: userProcedure
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
