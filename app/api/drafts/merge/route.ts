import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { DraftSnapshot, mergeDraftSnapshots, parseDraftSnapshot } from "@/lib/drafts";

const DRAFT_COOKIE_NAME = "draft_id";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    payload = undefined;
  }

  let localDraft: DraftSnapshot | null = null;
  if (payload && typeof payload === "object" && Object.keys(payload as Record<string, unknown>).length > 0) {
    localDraft = parseDraftSnapshot(payload);

    if (!localDraft) {
      return NextResponse.json({ error: "Brouillon invalide" }, { status: 422 });
    }
  }

  const guestToken = request.cookies.get(DRAFT_COOKIE_NAME)?.value ?? null;

  const [userDraft, guestDraft] = await Promise.all([
    prisma.katanaDraft.findFirst({ where: { ownerId: user.id } }),
    guestToken ? prisma.katanaDraft.findFirst({ where: { guestToken } }) : Promise.resolve(null),
  ]);

  const merged = mergeDraftSnapshots(
    toSnapshot(userDraft),
    mergeDraftSnapshots(toSnapshot(guestDraft), localDraft),
  );

  const persisted = await prisma.$transaction(async (transaction) => {
    if (guestDraft) {
      await transaction.katanaDraft.delete({ where: { id: guestDraft.id } });
    }

    if (!merged) {
      if (userDraft) {
        await transaction.katanaDraft.delete({ where: { id: userDraft.id } });
      }
      return null;
    }

    if (userDraft) {
      return transaction.katanaDraft.update({
        where: { id: userDraft.id },
        data: {
          handleColor: merged.handleColor,
          bladeTint: merged.bladeTint,
          metalness: merged.metalness,
          roughness: merged.roughness,
          quantity: merged.quantity,
          guestToken: null,
        },
      });
    }

    return transaction.katanaDraft.create({
      data: {
        ownerId: user.id,
        handleColor: merged.handleColor,
        bladeTint: merged.bladeTint,
        metalness: merged.metalness,
        roughness: merged.roughness,
        quantity: merged.quantity,
      },
    });
  });

  const response = NextResponse.json(
    {
      draft: persisted ? serializeDraft(persisted) : null,
    },
    { status: 200 },
  );
  response.cookies.delete(DRAFT_COOKIE_NAME);

  return response;
}

function toSnapshot(record: {
  handleColor: string;
  bladeTint: string;
  metalness: number;
  roughness: number;
  quantity: number;
  updatedAt: Date;
} | null): DraftSnapshot | null {
  if (!record) {
    return null;
  }

  return {
    handleColor: record.handleColor,
    bladeTint: record.bladeTint,
    metalness: record.metalness,
    roughness: record.roughness,
    quantity: record.quantity,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function serializeDraft(record: {
  handleColor: string;
  bladeTint: string;
  metalness: number;
  roughness: number;
  quantity: number;
  updatedAt: Date;
}) {
  return {
    handleColor: record.handleColor,
    bladeTint: record.bladeTint,
    metalness: record.metalness,
    roughness: record.roughness,
    quantity: record.quantity,
    updatedAt: record.updatedAt.toISOString(),
  };
}
