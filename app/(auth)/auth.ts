import { compare } from "bcrypt-ts";
import NextAuth, { type DefaultSession } from "next-auth";
import type { DefaultJWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { DUMMY_PASSWORD } from "@/lib/constants";
import { isDevelopmentEnvironment } from "@/lib/constants";
import { createGuestUser, getUser } from "@/lib/db/queries";
import { authConfig } from "./auth.config";

export type UserType = "guest" | "regular";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      type: UserType;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    email?: string | null;
    type: UserType;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    type: UserType;
  }
}

const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || process.env.SECRET;
const mask = (s: string | undefined) => s ? `${s.substring(0, 4)}...${s.substring(s.length - 4)} (length: ${s.length})` : "missing";

if (!isDevelopmentEnvironment) {
  console.info("[Auth Diagnostics] Checking environment variables...");
  console.info(`[Auth Diagnostics] AUTH_SECRET: ${mask(process.env.AUTH_SECRET)}`);
  console.info(`[Auth Diagnostics] NEXTAUTH_SECRET: ${mask(process.env.NEXTAUTH_SECRET)}`);
  console.info(`[Auth Diagnostics] SECRET: ${mask(process.env.SECRET)}`);
  console.info(`[Auth Diagnostics] AUTH_TRUST_HOST: ${process.env.AUTH_TRUST_HOST}`);
  console.info(`[Auth Diagnostics] BACKEND_URL: ${process.env.BACKEND_URL || "not set"}`);
  console.info(`[Auth Diagnostics] POSTGRES_URL: ${process.env.POSTGRES_URL ? "present (masked)" : "not set"}`);
  console.info(`[Auth Diagnostics] NODE_ENV: ${process.env.NODE_ENV}`);

  if (!secret) {
    console.warn("[Auth Diagnostics] CRITICAL: No authentication secret detected at runtime. This will cause a 'MissingSecret' error.");
  } else {
    console.info(`[Auth Diagnostics] Effective secret being used: ${mask(secret)}`);
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  secret,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);

        if (users.length === 0) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const [user] = users;

        if (!user.password) {
          await compare(password, DUMMY_PASSWORD);
          return null;
        }

        const passwordsMatch = await compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return { ...user, type: "regular" };
      },
    }),
    Credentials({
      id: "guest",
      credentials: {},
      async authorize() {
        const [guestUser] = await createGuestUser();
        return { ...guestUser, type: "guest" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.type = user.type;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.type = token.type;
      }

      return session;
    },
  },
});
