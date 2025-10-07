
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { prisma } from "./prisma";
import { decodeAuthToken } from "./auth";

type IncomingRequest = NextRequest | Request | undefined;

export async function getAuthenticatedUser(req?: IncomingRequest) {
  const token = extractToken(req);

  if (!token) {
    return null;
  }

  const payload = decodeAuthToken(token);

  if (!payload?.sub) {
    return null;
  }

  try {
    return prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch {
    return null;
  }
}

export function clearAuthCookie() {
  cookies().delete("auth_token");
}

export function setAuthCookie(token: string) {
  cookies().set("auth_token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

function isNextRequest(request: IncomingRequest): request is NextRequest {
  return typeof request === "object" && request !== null && "cookies" in request;
}

function extractToken(req?: IncomingRequest) {
  if (req) {
    const cookieToken = isNextRequest(req) ? req.cookies.get("auth_token")?.value : null;

    if (cookieToken) {
      return cookieToken;
    }

    const authHeader = req.headers.get("authorization");

    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.slice("Bearer ".length);
    }

    const cookieHeader = req.headers.get("cookie");

    if (cookieHeader) {
      const parsed = cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("auth_token="));

      if (parsed) {
        return parsed.split("=")[1];
      }
    }
  }

  return cookies().get("auth_token")?.value ?? null;
}
