import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { backgroundColorSchema } from "@/lib/background";
import { z } from "zod";

const bodySchema = z.object({
  backgroundColor: backgroundColorSchema,
});

export async function PUT(request: NextRequest) {
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

  const parsed = bodySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Couleur invalide" }, { status: 422 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { backgroundColor: parsed.data.backgroundColor },
    select: { backgroundColor: true },
  });

  return NextResponse.json({ backgroundColor: updated.backgroundColor }, { status: 200 });
}
