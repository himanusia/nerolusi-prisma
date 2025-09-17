import { SubtestType } from "@prisma/client";
import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "~/server/api/trpc";

export const adminRouter = createTRPCRouter({
  // Dashboard stats
  getDashboardStats: adminProcedure.query(async ({ ctx }) => {
    const totalUsers = await ctx.db.user.count();
    const totalPackages = await ctx.db.package.count();
    const activeSessions = await ctx.db.quizSession.count({
      where: {
        endTime: null, // Ongoing sessions
      },
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
    });

    return users;
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
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      user.token += input.amount;

      await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          token: user.token,
        },
      });

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
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.userId,
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      user.token -= input.amount;

      await ctx.db.user.update({
        where: {
          id: input.userId,
        },
        data: {
          token: user.token,
        },
      });

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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform to match expected interface
    return tryouts.map((tryout) => ({
      id: tryout.id,
      name: tryout.name,
      description: `TKA Tryout for ${tryout.class?.name || "All Classes"}`,
      startDate: tryout.TOstart || new Date(),
      endDate: tryout.TOend || new Date(),
      duration: 120, // Default 2 hours
      maxParticipants: 100, // Default
      participants: 0, // Would need to count from quiz sessions
      isActive: tryout.TOstart
        ? new Date() >= tryout.TOstart &&
          new Date() <= (tryout.TOend || new Date())
        : false,
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
          TOstart: new Date(input.startDate),
          TOend: new Date(input.endDate),
        },
      });

      return tryout;
    }),

  deleteTKATryout: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.package.delete({
        where: { id: input.id },
      });
    }),

  // Package management
  getPackageById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: input.id },
        include: {
          class: true,
          subtests: {
            include: {
              questions: true,
            },
            orderBy: { type: "asc" },
          },
        },
      });

      if (!packageData) {
        throw new Error("Package not found");
      }

      return packageData;
    }),

  updatePackage: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        classId: z.number().optional().nullable(),
        TOstart: z.string(),
        TOend: z.string(),
        tokenPrice: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updatedPackage = await ctx.db.package.update({
        where: { id: input.id },
        data: {
          name: input.name,
          classId: input.classId ?? undefined,
          TOstart: new Date(input.TOstart),
          TOend: new Date(input.TOend),
          tokenPrice: input.tokenPrice,
        },
      });

      return updatedPackage;
    }),

  // Subtest management
  createSubtest: adminProcedure
    .input(
      z.object({
        type: z.enum(Object.values(SubtestType) as [SubtestType, ...SubtestType[]]),
        packageId: z.string(),
        duration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const subtest = await ctx.db.subtest.create({
        data: {
          type: input.type,
          packageId: input.packageId,
          duration: input.duration,
        },
      });

      return subtest;
    }),

  deleteSubtest: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // This will cascade delete questions as well
      await ctx.db.subtest.delete({
        where: { id: input.id },
      });
    }),

  // Class management
  getClasses: adminProcedure.query(async ({ ctx }) => {
    const classes = await ctx.db.class.findMany({
      orderBy: { name: "asc" },
    });
    return classes;
  }),

  // TKA Videos (placeholder - you'd need a Video model)
  getTKAVideos: adminProcedure.query(async ({ ctx }) => {
    const videos = await ctx.db.video.findMany({
      where: {
        type: "rekaman",
      },
    });
    return videos;
  }),

  createTKAVideo: adminProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        videoUrl: z.string(),
        duration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.video.create({
        data: {
          title: input.title,
          description: input.description,
          type: "rekaman",
          url: input.videoUrl,
          duration: input.duration,
        },
      });
    }),

  updateTKAVideo: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        videoUrl: z.string(),
        duration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.video.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          url: input.videoUrl,
          duration: input.duration,
        },
      });
    }),

  deleteTKAVideo: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.video.delete({
        where: { id: input.id },
      });
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
    const drills = await ctx.db.subtest.findMany({
      where: {
        type: "materi",
      },
      include: {
        questions: true,
        topics: {
          include: {
            material: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
    });

    // Transform to match expected interface
    return drills.map((drill) => ({
      id: drill.id,
      title: drill.topics?.name ?? "",
      subject: drill.topics?.material?.subject.name ?? "",
      difficulty: "medium", // Default - you may want to add difficulty field
      timeLimit: drill.duration, // 10 minutes default
      questionCount: drill.questions.length,
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
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.package.delete({
        where: { id: input.id },
      });
    }),

  // === Material & Topic Management ===
  getSubjects: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.subject.findMany({
      orderBy: { id: "asc" },
    });
  }),

  getMaterialsBySubject: adminProcedure
    .input(z.object({ subjectId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.material.findMany({
        where: { subjectId: input.subjectId },
        include: {
          topics: {
            include: {
              video: true,
              subtest: {
                include: {
                  questions: true,
                },
              },
            },
            orderBy: { index: "asc" },
          },
        },
        orderBy: { index: "asc" },
      });
    }),

  createMaterial: adminProcedure
    .input(
      z.object({
        subjectId: z.number(),
        name: z.string(),
        index: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if index already exists for this subject
      const existingMaterial = await ctx.db.material.findFirst({
        where: {
          subjectId: input.subjectId,
          index: input.index,
        },
      });

      if (existingMaterial) {
        throw new Error(
          `Material with index ${input.index} already exists for this subject`,
        );
      }

      return ctx.db.material.create({
        data: {
          subjectId: input.subjectId,
          name: input.name,
          index: input.index,
        },
      });
    }),

  updateMaterial: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        index: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get the material to check its subject
      const material = await ctx.db.material.findUnique({
        where: { id: input.id },
      });

      if (!material) {
        throw new Error("Material not found");
      }

      // Check if index already exists for this subject (excluding current material)
      const existingMaterial = await ctx.db.material.findFirst({
        where: {
          subjectId: material.subjectId,
          index: input.index,
          id: { not: input.id },
        },
      });

      if (existingMaterial) {
        throw new Error(
          `Material with index ${input.index} already exists for this subject`,
        );
      }

      return ctx.db.material.update({
        where: { id: input.id },
        data: {
          name: input.name,
          index: input.index,
        },
      });
    }),

  deleteMaterial: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Also deletes topics via cascade
      return ctx.db.material.delete({ where: { id: input.id } });
    }),

  createTopic: adminProcedure
    .input(
      z.object({
        materialId: z.number(),
        name: z.string(),
        index: z.number(),
        videoTitle: z.string(),
        videoUrl: z.string(),
        videoDuration: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if index already exists for this material
      const existingTopic = await ctx.db.topic.findFirst({
        where: {
          materialId: input.materialId,
          index: input.index,
        },
      });

      if (existingTopic) {
        throw new Error(
          `Topic with index ${input.index} already exists for this material`,
        );
      }

      // Create video and subtest first, then create topic
      return ctx.db.$transaction(async (tx) => {
        // Create the video
        const video = await tx.video.create({
          data: {
            title: input.videoTitle,
            url: input.videoUrl,
            duration: input.videoDuration,
            type: "materi",
          },
        });

        // Now create the topic with the required relationships
        const topic = await tx.topic.create({
          data: {
            materialId: input.materialId,
            name: input.name,
            index: input.index,
            videoId: video.id,
          },
        });

        return topic;
      });
    }),

  updateTopic: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        index: z.number(),
        videoTitle: z.string().optional(),
        videoUrl: z.string().optional(),
        videoDuration: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, index, videoTitle, videoUrl, videoDuration } = input;

      return ctx.db.$transaction(async (tx) => {
        // Get the topic to check its material
        const topic = await tx.topic.findUnique({
          where: { id },
        });

        if (!topic) {
          throw new Error("Topic not found");
        }

        // Check if index already exists for this material (excluding current topic)
        const existingTopic = await tx.topic.findFirst({
          where: {
            materialId: topic.materialId,
            index: index,
            id: { not: id },
          },
        });

        if (existingTopic) {
          throw new Error(
            `Topic with index ${index} already exists for this material`,
          );
        }

        // Update the topic
        const updatedTopic = await tx.topic.update({
          where: { id },
          data: {
            name,
            index,
          },
        });

        // If video details are provided, update the related video
        if (videoTitle || videoUrl || videoDuration !== undefined) {
          await tx.video.update({
            where: { id: updatedTopic.videoId },
            data: {
              ...(videoTitle && { title: videoTitle }),
              ...(videoUrl && { url: videoUrl }),
              ...(videoDuration !== undefined && { duration: videoDuration }),
            },
          });
        }

        return updatedTopic;
      });
    }),

  deleteTopic: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.topic.delete({ where: { id: input.id } });
    }),

  createTopicDrill: adminProcedure
    .input(
      z.object({
        topicId: z.number(),
        topicName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        // Create a new subtest for the topic drill
        const subtest = await tx.subtest.create({
          data: {
            type: "materi",
            duration: 600, // Default 10 minutes
          },
        });

        // Update the topic to link it with the new subtest
        await tx.topic.update({
          where: { id: input.topicId },
          data: { subtestId: subtest.id },
        });

        return subtest;
      });
    }),
});
