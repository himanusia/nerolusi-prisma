import { z } from "zod";
import { createTRPCRouter, userProcedure } from "../trpc";
import { getUTBKSubjects } from "~/app/_components/constants";

export const modulRouter = createTRPCRouter({
  getAllModules: userProcedure
    .input(
      z.object({
        subjectId: z.number().nullable(),
        type: z.enum(["bahan_materi", "catatan"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const subject = await ctx.db.subject.findUnique({
        where: {
          id: input.subjectId ?? undefined,
        },
      });

      if (!subject) {
        throw new Error("Subject not found");
      }

      if (subject.mode === "utbk" && input.type === "catatan" && !ctx.session.user.classid) {
        throw new Error("User not enrolled in any class");
      }

      return await ctx.db.module.findMany({
        where: {
          ...(input.subjectId ? { subjectId: input.subjectId } : {}),
          ...(input.type === "catatan" ? { classId: ctx.session.user.classid } : {}),
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
        type: z.enum(["bahan_materi", "catatan"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.module.create({
        data: {
          title: input.title,
          description: input.description || null,
          subjectId: input.subjectId,
          url: input.url,
          type: input.type,
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
        type: z.enum(["bahan_materi", "catatan"]),
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
          type: input.type,
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

  getUTBKModulSubjects: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.subject.findMany({
      where: {
        type: "modul_nerolusi",
        mode: "utbk",
      },
    });
  }),

  getUTBKCatatanSubjects: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.subject.findMany({
      where: {
        type: "utbk",
        mode: "utbk",
      },
    });
  }),

  getTKASubjects: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.subject.findMany({
      where: {
        mode: "tka",
      },
    });
  }),
});
