import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: (DefaultSession["user"] & {
      id: string;
      googleId?: string | null;
    }) | null;
  }

  interface User extends DefaultUser {
    id: string;
    googleId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    googleId?: string | null;
  }
}
