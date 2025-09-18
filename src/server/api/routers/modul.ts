import { z } from "zod";
import { createTRPCRouter, userProcedure } from "../trpc";
import { url } from "inspector";

export const modulRouter = createTRPCRouter({
  getAllModules: userProcedure
    .input(
      z.object({
        subjectId: z.number().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.module.findMany({
        where: {
          subjectId: input.subjectId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  createModule: userProcedure
    .input(
      z.object({
        title: z.string().min(2).max(100),
        description: z.string().min(10).max(1000).optional(),
        subjectId: z.number(),
        url: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.module.create({
        data: {
          title: input.title,
          description: input.description,
          subjectId: input.subjectId,
          url: input.url,
        },
      });
    }),

    editModule: userProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(2).max(100),
        description: z.string().min(10).max(1000).optional(),
        url: z.string().url(),
        }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.module.update({
        where: {
            id: input.id,
        },
        data: {
          title: input.title,
            description: input.description,
          url: input.url,
        },
      });
    }),
    deleteModule: userProcedure
    .input(
      z.object({
        id: z.number(),
        }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.module.delete({
        where: {
            id: input.id,
        },
      });
    }),
});
