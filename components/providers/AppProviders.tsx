"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/components/auth/AuthProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  );
}
