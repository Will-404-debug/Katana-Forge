import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { createAuthToken, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";
import { setAuthCookie } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Identifiants invalides", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);

  if (!passwordValid) {
    return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
  }

  const token = createAuthToken(user.id);
  setAuthCookie(token);

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        googleId: user.googleId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
    { status: 200 },
  );
}
