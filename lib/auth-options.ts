import { randomBytes } from "node:crypto";

import GoogleProvider from "next-auth/providers/google";

import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function requiredEnv(name: string, fallbackName?: string) {
  const value = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);

  if (!value) {
    throw new Error(`Missing environment variable: ${name}${fallbackName ? ` (fallback ${fallbackName})` : ""}`);
  }

  return value;
}

async function upsertGoogleUser(params: {
  email: string;
  name: string;
  googleId: string;
}) {
  const { email, name, googleId } = params;
  const trimmedName = name.trim() || email.split("@")[0];

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    if (existingUser.googleId !== googleId || existingUser.name !== trimmedName) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          googleId,
          name: trimmedName,
        },
      });
    }

    return existingUser;
  }

  const fallbackPassword = randomBytes(48).toString("hex");
  const passwordHash = await hashPassword(fallbackPassword);

  return prisma.user.create({
    data: {
      email,
      name: trimmedName,
      googleId,
      passwordHash,
    },
  });
}

type AuthOptions = {
  session?: {
    strategy?: string;
  };
  secret?: string;
  providers: unknown[];
  pages?: {
    signIn?: string;
  };
  callbacks?: {
    signIn?: (...args: any[]) => unknown;
    jwt?: (...args: any[]) => unknown;
    session?: (...args: any[]) => unknown;
    redirect?: (...args: any[]) => unknown;
  };
};

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: requiredEnv("NEXTAUTH_SECRET", "JWT_SECRET"),
  providers: [
    GoogleProvider({
      clientId: requiredEnv("GOOGLE_CLIENT_ID"),
      clientSecret: requiredEnv("GOOGLE_CLIENT_SECRET"),
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/connexion",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = profile?.email?.toLowerCase();
      const emailVerifiedRaw = (profile as GoogleProfile | undefined)?.email_verified;
      const emailVerified =
        typeof emailVerifiedRaw === "string" ? emailVerifiedRaw === "true" : Boolean(emailVerifiedRaw);

      if (!email || !emailVerified) {
        return false;
      }

      const googleId = account.providerAccountId;
      const displayName =
        profile?.name ??
        [profile?.given_name, profile?.family_name]
          .filter(Boolean)
          .join(" ")
          .trim();

      await upsertGoogleUser({
        email,
        googleId,
        name: displayName ?? email.split("@")[0],
      });

      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider === "google" || !token.sub) {
        if (token.email) {
          const user = await prisma.user.findUnique({
            where: { email: token.email.toLowerCase() },
          });

          if (user) {
            token.sub = user.id;
            token.name = user.name;
            token.googleId = user.googleId ?? undefined;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.name = token.name ?? session.user.name ?? null;
        session.user.googleId = (token.googleId as string | undefined) ?? null;
      }

      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return url;
      }

      try {
        const targetUrl = new URL(url);
        if (targetUrl.origin === baseUrl) {
          return targetUrl.toString();
        }
      } catch {
        // ignore invalid URLs
      }

      return baseUrl;
    },
  },
};

type GoogleProfile = {
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  given_name?: string;
  family_name?: string;
};
