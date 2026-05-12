import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "~/server/db";
import { env } from "~/env";

export const authConfig = {
  providers: [
    GoogleProvider({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      // O Google às vezes falha no PKCE em proxies; 'nonce' é mais estável
      checks: ["nonce"], 
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "database", // Essencial para persistir usuários no Neon
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
  // Necessário para evitar o erro InvalidCheck na Vercel
  trustHost: true, 
} satisfies NextAuthConfig;