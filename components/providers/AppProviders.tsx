import type { ReactNode } from "react";

import AppProvidersClient from "./AppProvidersClient";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

type AppProvidersProps = {
  children: ReactNode;
};

export default async function AppProviders({ children }: AppProvidersProps) {
  const initialUser = await getAuthenticatedUser();

  return <AppProvidersClient initialUser={initialUser}>{children}</AppProvidersClient>;
}
