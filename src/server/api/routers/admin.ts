import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
} from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  // Dashboard stats
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.db.user.count();
    const totalPackages = await ctx.db.package.count();
    const activeSessions = await ctx.db.quizSession.count({
      where: { 
        endTime: null // Ongoing sessions
      }
    });
    
    return {
      totalUsers,
      totalPackages,
      activeSessions,
      tkaContent: 0, // Placeholder for now
    };
  }),

  // User management with coins (adding coins field to user model conceptually)
  getUsersWithCoins: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        class: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // For now, we'll return users with a coins field set to 0
    // In a real app, you'd have a coins field in the User model or a separate UserCoins table
    return users.map(user => ({
      ...user,
      coins: 0, // Placeholder - you'd need to add this field to your User model
    }));
  }),

  // Coin operations (placeholder implementations)
  addCoins: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Placeholder - you'd need to implement coin tracking in your database
      // For now, we'll just return success
      return { success: true };
    }),

  removeCoins: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number().positive(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Placeholder - you'd need to implement coin tracking in your database
      // For now, we'll just return success
      return { success: true };
    }),

  // TKA Tryouts (using existing Package model with type filtering)
  getTKATryouts: adminProcedure.query(async ({ ctx }) => {
    const tryouts = await ctx.db.package.findMany({
      where: {
        type: "tryout", // Assuming TKA tryouts use tryout type
      },
      include: {
        class: true,
        subtests: true,
      },
    });

    // Transform to match expected interface
    return tryouts.map(tryout => ({
      id: tryout.id,
      name: tryout.name,
      description: `TKA Tryout for ${tryout.class?.name || 'All Classes'}`,
      startDate: tryout.TOstart || new Date(),
      endDate: tryout.TOend || new Date(),
      duration: 120, // Default 2 hours
      maxParticipants: 100, // Default
      participants: 0, // Would need to count from quiz sessions
      isActive: tryout.TOstart ? new Date() >= tryout.TOstart && new Date() <= (tryout.TOend || new Date()) : false,
    }));
  }),

  createTKATryout: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        duration: z.number(),
        maxParticipants: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create a new package as a tryout
      const tryout = await ctx.db.package.create({
        data: {
          name: input.name,
          type: "tryout",
          classId: 1, // Default class - you may want to make this configurable
          TOstart: new Date(input.startDate),
          TOend: new Date(input.endDate),
        },
      });
      
      return tryout;
    }),

  deleteTKATryout: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.package.delete({
        where: { id: input.id },
      });
    }),

  // TKA Videos (placeholder - you'd need a Video model)
  getTKAVideos: adminProcedure.query(async ({ ctx }) => {
    // Placeholder - return empty array for now
    // You'd need to create a Video model in your schema
    return [];
  }),

  createTKAVideo: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        videoUrl: z.string(),
        category: z.string(),
        duration: z.string(),
        thumbnailUrl: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Placeholder - you'd need a Video model
      return { success: true };
    }),

  deleteTKAVideo: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Placeholder - you'd need a Video model
      return { success: true };
    }),

  // TKA Activities (placeholder)
  getTKAActivities: adminProcedure.query(async ({ ctx }) => {
    // Placeholder - return empty array for now
    return [];
  }),

  createTKAActivity: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        type: z.string(),
        difficulty: z.string(),
        estimatedTime: z.number(),
        points: z.number(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Placeholder - you'd need an Activity model
      return { success: true };
    }),

  deleteTKAActivity: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Placeholder - you'd need an Activity model
      return { success: true };
    }),

  // TKA Drills (using existing Package model with drill type)
  getTKADrills: adminProcedure.query(async ({ ctx }) => {
    const drills = await ctx.db.package.findMany({
      where: {
        type: "drill",
      },
      include: {
        class: true,
        subtests: {
          include: {
            questions: true,
          },
        },
      },
    });

    // Transform to match expected interface
    return drills.map(drill => ({
      id: drill.id,
      title: drill.name,
      description: `TKA Drill for ${drill.class?.name || 'All Classes'}`,
      subject: "Matematika", // Default - you may want to add subject field
      difficulty: "medium", // Default - you may want to add difficulty field
      timeLimit: 600, // 10 minutes default
      questionCount: drill.subtests.reduce((sum, subtest) => sum + subtest.questions.length, 0),
      isActive: true,
      attempts: 0, // Would need to count from quiz sessions
      averageScore: 0, // Would need to calculate from quiz sessions
      completionRate: 0, // Would need to calculate from quiz sessions
    }));
  }),

  createTKADrill: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        subject: z.string(),
        difficulty: z.string(),
        timeLimit: z.number(),
        questionCount: z.number(),
        isActive: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Create a new package as a drill
      const drill = await ctx.db.package.create({
        data: {
          name: input.title,
          type: "drill",
          classId: 1, // Default class - you may want to make this configurable
        },
      });
      
      return drill;
    }),

  deleteTKADrill: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.package.delete({
        where: { id: input.id },
      });
    }),
});
