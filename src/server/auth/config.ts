import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "~/server/db";

const defaultAdmin = [
  "nerolusi3@gmail.com",
  "cpnerolusi@gmail.com"
]

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      classid?: number;
      enrolledUtbk?: boolean;
      enrolledTka?: boolean;
      token?: number;
    } & DefaultSession["user"];
  }
}

export const authConfig = {
  providers: [Google],
  adapter: PrismaAdapter(db),
  events: {
    async createUser({ user }) {
      if (user.email && defaultAdmin.includes(user.email)) {
        await db.user.update({
          where: { id: user.id },
          data: { role: "admin" },
        });
      }
    },
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
  },
} satisfies NextAuthConfig;
