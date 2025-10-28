import { NextRequest, NextResponse } from "next/server";

import { katanaCreateSchema } from "@/lib/validation";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { katanaRepository } from "@/lib/db/katanas.repo";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  const katanas = await katanaRepository.listByOwner(user.id);

  return NextResponse.json({ katanas }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
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

  const katana = await katanaRepository.create({
    ownerId: user.id,
    name: parsed.data.name,
    handleColor: parsed.data.handleColor,
    bladeTint: parsed.data.bladeTint,
    metalness: parsed.data.metalness,
    roughness: parsed.data.roughness,
  });

  return NextResponse.json({ katana }, { status: 201 });
}
