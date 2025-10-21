"use client";

import { useMemo } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

export function useSession() {
  const { user, initializing, refreshUser, login, register, logout } = useAuth();

  const status = initializing ? "loading" : user ? "authenticated" : "unauthenticated";

  return useMemo(
    () => ({
      status,
      user,
      initializing,
      isAuthenticated: status === "authenticated",
      refreshUser,
      login,
      register,
      logout,
    }),
    [status, user, initializing, refreshUser, login, register, logout],
  );
}
