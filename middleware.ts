import { NextResponse, type NextRequest } from "next/server";

const CSRF_COOKIE = "kf.csrf";
const CSRF_HEADER = "x-csrf-token";
const CUSTOM_AUTH_MUTATIONS = new Set(["/api/auth/login", "/api/auth/register", "/api/auth/logout"]);
const encoder = new TextEncoder();

export function middleware(request: NextRequest) {
  const method = request.method.toUpperCase();
  const pathname = request.nextUrl.pathname;

  const isCustomAuthRoute = pathname.startsWith("/api/auth/") && CUSTOM_AUTH_MUTATIONS.has(pathname);
  const isNextAuthInternalRoute = pathname.startsWith("/api/auth/") && !isCustomAuthRoute;

  if (isMutation(method) && pathname.startsWith("/api/") && !isNextAuthInternalRoute) {
    const originResponse = ensureOriginIsAllowed(request);
    if (originResponse) {
      return originResponse;
    }

    const csrfResponse = ensureCsrfToken(request);
    if (csrfResponse) {
      return csrfResponse;
    }
  }

  const response = NextResponse.next();

  if (!request.cookies.has(CSRF_COOKIE)) {
    response.cookies.set({
      name: CSRF_COOKIE,
      value: generateToken(),
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), autoplay=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), usb=()",
  );

  return response;
}

const isMutation = (method: string) =>
  method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

const ensureOriginIsAllowed = (request: NextRequest) => {
  const origin = request.headers.get("origin");
  const allowedOrigin = request.nextUrl.origin;

  if (origin && origin !== allowedOrigin) {
    return NextResponse.json({ error: "Origine non autorisée" }, { status: 403 });
  }

  return null;
};

const ensureCsrfToken = (request: NextRequest) => {
  const headerToken = request.headers.get(CSRF_HEADER);
  const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;

  if (!headerToken || !cookieToken) {
    return NextResponse.json({ error: "CSRF token manquant" }, { status: 403 });
  }

  const headerBytes = encoder.encode(headerToken);
  const cookieBytes = encoder.encode(cookieToken);

  if (!constantTimeEquals(headerBytes, cookieBytes)) {
    return NextResponse.json({ error: "CSRF token invalide" }, { status: 403 });
  }

  return null;
};

export const config = {
  matcher: ["/api/:path*", "/checkout/:path*"],
};

const generateToken = () => {
  const bytes = new Uint8Array(32);
  getCrypto().getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
};

const constantTimeEquals = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }

  return diff === 0;
};

const getCrypto = (): Crypto => {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi || typeof cryptoApi.getRandomValues !== "function") {
    throw new Error("Crypto API is unavailable in this runtime");
  }
  return cryptoApi;
};
