import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { draftContentSchema } from "@/lib/drafts";

const DRAFT_COOKIE_NAME = "draft_id";
const DRAFT_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  const draftCookie = getDraftCookie(request);

  const draft = user
    ? await prisma.katanaDraft.findFirst({ where: { ownerId: user.id } })
    : draftCookie
      ? await prisma.katanaDraft.findFirst({ where: { guestToken: draftCookie } })
      : null;

  if (!draft) {
    return NextResponse.json({ draft: null }, { status: 200 });
  }

  const response = NextResponse.json({ draft: serializeDraft(draft) }, { status: 200 });

  if (!user && draft.guestToken) {
    setDraftCookie(response, draft.guestToken);
  }

  return response;
}

export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const parsed = draftContentSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Brouillon invalide", issues: parsed.error.flatten() }, { status: 422 });
  }

  const draftCookie = getDraftCookie(request);

  const updated = await prisma.$transaction(async (transaction) => {
    if (user) {
      const existing = await transaction.katanaDraft.findFirst({
        where: { ownerId: user.id },
      });

      if (existing) {
        return transaction.katanaDraft.update({
          where: { id: existing.id },
          data: withDraftData(parsed.data, { guestToken: null }),
        });
      }

      return transaction.katanaDraft.create({
        data: {
          ownerId: user.id,
          ...withDraftData(parsed.data),
        },
      });
    }

    if (draftCookie) {
      const existing = await transaction.katanaDraft.findFirst({
        where: { guestToken: draftCookie },
      });

      if (existing) {
        return transaction.katanaDraft.update({
          where: { id: existing.id },
          data: withDraftData(parsed.data),
        });
      }
    }

    const guestToken = draftCookie ?? randomUUID();

    return transaction.katanaDraft.create({
      data: {
        guestToken,
        ...withDraftData(parsed.data),
      },
    });
  });

  const response = NextResponse.json({ draft: serializeDraft(updated) }, { status: 200 });

  if (user) {
    response.cookies.delete(DRAFT_COOKIE_NAME);
  } else if (updated.guestToken) {
    setDraftCookie(response, updated.guestToken);
  }

  return response;
}

function serializeDraft(draft: {
  handleColor: string;
  bladeTint: string;
  metalness: number;
  roughness: number;
  quantity: number;
  updatedAt: Date;
}) {
  return {
    handleColor: draft.handleColor,
    bladeTint: draft.bladeTint,
    metalness: draft.metalness,
    roughness: draft.roughness,
    quantity: draft.quantity,
    updatedAt: draft.updatedAt.toISOString(),
  };
}

function withDraftData(data: {
  handleColor: string;
  bladeTint: string;
  metalness: number;
  roughness: number;
  quantity: number;
}, extra?: { guestToken?: string | null }) {
  return {
    handleColor: data.handleColor,
    bladeTint: data.bladeTint,
    metalness: data.metalness,
    roughness: data.roughness,
    quantity: data.quantity,
    ...(extra ?? {}),
  };
}

function setDraftCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: DRAFT_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DRAFT_COOKIE_MAX_AGE,
    path: "/",
  });
}

function getDraftCookie(request: NextRequest) {
  return request.cookies.get(DRAFT_COOKIE_NAME)?.value ?? null;
}
