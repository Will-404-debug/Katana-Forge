import { describe, expect, it } from "vitest";

import type { DraftSnapshot } from "@/lib/drafts";
import { mergeDraftSnapshots } from "@/lib/drafts";

function draft(data: Partial<DraftSnapshot> = {}): DraftSnapshot {
  return {
    handleColor: "#111111",
    bladeTint: "#dddddd",
    metalness: 0.5,
    roughness: 0.4,
    quantity: 1,
    updatedAt: new Date("2025-01-01T00:00:00.000Z").toISOString(),
    ...data,
  };
}

describe("mergeDraftSnapshots", () => {
  it("returns null when both inputs are empty", () => {
    expect(mergeDraftSnapshots(null, null)).toBeNull();
  });

  it("prefers the snapshot with the most recent update for options", () => {
    const base = draft({ handleColor: "#ff0000", updatedAt: "2025-01-01T00:00:00.000Z" });
    const incoming = draft({ handleColor: "#00ff00", updatedAt: "2025-02-01T00:00:00.000Z" });

    const merged = mergeDraftSnapshots(base, incoming);

    expect(merged).not.toBeNull();
    expect(merged?.handleColor).toBe("#00ff00");
  });

  it("keeps the max quantity to stay idempotent", () => {
    const base = draft({ quantity: 2 });
    const incoming = draft({ quantity: 5, updatedAt: "2025-02-01T00:00:00.000Z" });

    const merged = mergeDraftSnapshots(base, incoming);

    expect(merged?.quantity).toBe(5);
  });

  it("is idempotent when called multiple times with the same data", () => {
    const original = draft({ quantity: 3, updatedAt: "2025-03-01T00:00:00.000Z" });

    const first = mergeDraftSnapshots(original, null);
    const second = mergeDraftSnapshots(first, original);

    expect(second).toEqual(first);
  });
});
