import { get } from "http";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  userProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getSessionUser: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        image: true,
        name: true,
        email: true,
        role: true,
        class: {
          select: {
            name: true,
          },
        },
      },
    });
  }),

  getAllUsers: userProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        class: true,
      },
    });
    return users ?? null;
  }),

  updateRole: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["user", "teacher", "admin"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.id },
        data: { role: input.role },
      });
    }),

  // New mutation to update user's class
  updateClass: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        classId: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { classid: input.classId },
      });
    }),

  // New mutation to update enrolledUtbk
  updateEnrolledUtbk: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        enrolledUtbk: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { enrolledUtbk: input.enrolledUtbk },
      });
    }),

  // New mutation to update enrolledTka
  updateEnrolledTka: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        enrolledTka: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { enrolledTka: input.enrolledTka },
      });
    }),

  updateSekolah: userProcedure
    .input(
      z.object({
        sekolah: z.string().min(1, "Nama sekolah tidak boleh kosong"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { school: input.sekolah },
      });
    }),

  updateTanggalLahir: userProcedure
    .input(
      z.object({
        tanggalLahir: z.date(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { birthDate: input.tanggalLahir },
      });
    }),

  updatePilihanJurusan: userProcedure
    .input(
      z.object({
        pilihan1: z.number(),
        pilihan2: z.number(),
        pilihan3: z.number(),
        pilihan4: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        // First, clear existing jurusan choices
        await tx.userMajorChoice.deleteMany({
          where: { userId: ctx.session.user.id },
        });

        // Then, create new jurusan choices
        const choices = [
          { majorId: input.pilihan1, priority: 1 },
          { majorId: input.pilihan2, priority: 2 },
          { majorId: input.pilihan3, priority: 3 },
          { majorId: input.pilihan4, priority: 4 },
        ];
        return await Promise.all(
          choices.map((choice) =>
            tx.userMajorChoice.create({
              data: {
                userId: ctx.session.user.id,
                majorId: choice.majorId,
                choiceNumber: choice.priority,
              },
            }),
          ),
        );
      });
    }),

  getUserMajorChoices: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.userMajorChoice.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        major: {
          include: {
            university: true,
          },
        },
      },
      orderBy: {
        choiceNumber: "asc",
      },
    });
  }),

  getAllMajors: userProcedure
    .input(
      z.object({
        filter: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.major.findMany({
        include: {
          university: true,
        },
        orderBy: {
          name: "asc",
          university: { name: "asc" },
        },
        where: {
          OR: [
            { name: { contains: input.filter, mode: "insensitive" } },
            {
              university: {
                name: { contains: input.filter, mode: "insensitive" },
              },
            },
          ],
        },
      });
    }),

  getTopKegiatan: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.event.findMany({
      orderBy: {
        startTime: "asc",
      },
      take: 3,
    });
  }),

  getAllKegiatan: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.event.findMany({
      orderBy: {
        startTime: "asc",
      },
    });
  }),
});
