"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { signOut } from "next-auth/react";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  googleId?: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  user: AuthUser;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

type AuthActionResult = {
  success: boolean;
  error?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  initializing: boolean;
  refreshUser: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<AuthActionResult>;
  register: (payload: RegisterPayload) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function parseResponse<T>(response: Response) {
  const data = (await response.json().catch(() => ({}))) as Partial<T> & { error?: string };
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          return;
        }
        const data = await parseResponse<AuthResponse>(response);
        throw new Error(data.error ?? "Impossible de récuperer le profil");
      }

      const data = (await response.json()) as AuthResponse;
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await refreshUser();
      } finally {
        if (active) {
          setInitializing(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [refreshUser]);

  const login = useCallback(
    async ({ email, password }: LoginPayload): Promise<AuthActionResult> => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const data = await parseResponse<AuthResponse>(response);
          return { success: false, error: data.error ?? "Identifiants invalides" };
        }

        const data = (await response.json()) as AuthResponse;
        setUser(data.user);
        return { success: true };
      } catch {
        return { success: false, error: "Impossible de se connecter pour le moment" };
      }
    },
    [],
  );

  const register = useCallback(
    async ({ email, password, name }: RegisterPayload): Promise<AuthActionResult> => {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password, name }),
        });

        if (!response.ok) {
          const data = await parseResponse<AuthResponse>(response);
          return { success: false, error: data.error ?? "Impossible de créer le compte" };
        }

        const data = (await response.json()) as AuthResponse;
        setUser(data.user);
        return { success: true };
      } catch {
        return { success: false, error: "Impossible de créer le compte" };
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      await signOut({ redirect: false });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      refreshUser,
      login,
      register,
      logout,
    }),
    [user, initializing, refreshUser, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
