import type { ReactNode } from "react";

import { getAuthenticatedUser } from "@/lib/auth-helpers";
import AppProvidersClient from "./AppProvidersClient";
import type { AuthUser } from "@/components/auth/AuthProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export default async function AppProviders({ children }: AppProvidersProps) {
  const user = await getAuthenticatedUser();
  const initialUser: AuthUser | null = user
    ? {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }
    : null;

  return <AppProvidersClient initialUser={initialUser}>{children}</AppProvidersClient>;
}
