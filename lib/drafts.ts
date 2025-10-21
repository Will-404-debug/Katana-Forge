import { z } from "zod";

import { katanaConfigSchema } from "@/lib/validation";

export const draftContentSchema = katanaConfigSchema.extend({
  quantity: z.number().int().min(1, "Quantite minimale 1").max(10, "Quantite maximale 10"),
});

export const draftSnapshotSchema = draftContentSchema.extend({
  updatedAt: z.string().datetime().optional(),
});

export type DraftContent = z.infer<typeof draftContentSchema>;
export type DraftSnapshot = z.infer<typeof draftSnapshotSchema>;

export function mergeDraftSnapshots(
  base: DraftSnapshot | null | undefined,
  incoming: DraftSnapshot | null | undefined,
): DraftSnapshot | null {
  if (!base && !incoming) {
    return null;
  }

  if (!base) {
    return incoming ? { ...incoming } : null;
  }

  if (!incoming) {
    return { ...base };
  }

  const baseTimestamp = parseTimestamp(base.updatedAt);
  const incomingTimestamp = parseTimestamp(incoming.updatedAt);

  const latestSnapshot = incomingTimestamp >= baseTimestamp ? incoming : base;

  return {
    handleColor: latestSnapshot.handleColor,
    bladeTint: latestSnapshot.bladeTint,
    metalness: latestSnapshot.metalness,
    roughness: latestSnapshot.roughness,
    quantity: Math.max(base.quantity, incoming.quantity),
    updatedAt: new Date(Math.max(baseTimestamp, incomingTimestamp)).toISOString(),
  };
}

export function parseDraftSnapshot(data: unknown): DraftSnapshot | null {
  const parsed = draftSnapshotSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }

  return {
    ...parsed.data,
    updatedAt: parsed.data.updatedAt ?? new Date().toISOString(),
  };
}

function parseTimestamp(value?: string) {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}
