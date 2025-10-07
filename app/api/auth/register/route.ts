import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashPassword, createAuthToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { setAuthCookie } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Donnees invalides", issues: parsed.error.flatten() }, { status: 422 });
  }

  const { email, password, name } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    return NextResponse.json({ error: "Un compte existe deja avec cet email" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = createAuthToken(user.id);
  setAuthCookie(token);

  return NextResponse.json({ user }, { status: 201 });
}
