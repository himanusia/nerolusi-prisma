import { z } from "zod";
import { createTRPCRouter, userProcedure } from "../trpc";

export const modulRouter = createTRPCRouter({
  getAllModules: userProcedure
    .input(
      z.object({
        subjectId: z.number().nullable(),
        type: z.enum(["bahan_materi", "catatan"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.module.findMany({
        where: {
          ...(input.subjectId ? { subjectId: input.subjectId } : {}),
          type: input.type,
        },
        include: {
          subject: true,
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
        description: z.string().max(1000).nullish(),
        subjectId: z.number(),
        url: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.module.create({
        data: {
          title: input.title,
          description: input.description || null,
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
        description: z.string().max(1000).nullish(),
        subjectId: z.number(),
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
          description: input.description || null,
          subjectId: input.subjectId,
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

  getSubjectById: userProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.subject.findUnique({
        where: {
          id: input.id,
        },
      });
    }),
});
