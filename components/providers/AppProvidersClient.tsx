"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { AuthProvider, type AuthUser } from "@/components/auth/AuthProvider";

type AppProvidersClientProps = {
  children: ReactNode;
  initialUser: AuthUser | null;
};

export default function AppProvidersClient({ children, initialUser }: AppProvidersClientProps) {
  return (
    <SessionProvider>
      <AuthProvider initialUser={initialUser}>{children}</AuthProvider>
    </SessionProvider>
  );
}
