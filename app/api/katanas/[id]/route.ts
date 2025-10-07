import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { katanaCreateSchema } from "@/lib/validation";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

async function getKatanaOrThrow(id: string, userId: string) {
  const katana = await prisma.katana.findUnique({
    where: { id },
  });

  if (!katana || katana.ownerId !== userId) {
    return null;
  }

  return katana;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const katana = await getKatanaOrThrow(params.id, user.id);

  if (!katana) {
    return NextResponse.json({ error: "Katana introuvable" }, { status: 404 });
  }

  return NextResponse.json({ katana }, { status: 200 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const katana = await getKatanaOrThrow(params.id, user.id);

  if (!katana) {
    return NextResponse.json({ error: "Katana introuvable" }, { status: 404 });
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const parsed = katanaCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Configuration invalide", issues: parsed.error.flatten() }, { status: 422 });
  }

  const updatedKatana = await prisma.katana.update({
    where: { id: katana.id },
    data: {
      name: parsed.data.name,
      handleColor: parsed.data.handleColor,
      bladeTint: parsed.data.bladeTint,
      metalness: parsed.data.metalness,
      roughness: parsed.data.roughness,
    },
  });

  return NextResponse.json({ katana: updatedKatana }, { status: 200 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const katana = await getKatanaOrThrow(params.id, user.id);

  if (!katana) {
    return NextResponse.json({ error: "Katana introuvable" }, { status: 404 });
  }

  await prisma.katana.delete({ where: { id: katana.id } });

  return NextResponse.json({ success: true }, { status: 200 });
}
