import type { Katana, PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

import {
  KatanaNotFoundError,
  KatanaOwnershipError,
  katanaRepository,
  type KatanaCreateInput,
} from "@/lib/db/katanas.repo";

const baseKatana: Katana = {
  id: "kat_test",
  ownerId: "usr_owner",
  name: "Prototype",
  handleColor: "#111111",
  bladeTint: "#eeeeee",
  metalness: 0.5,
  roughness: 0.3,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-02T00:00:00.000Z"),
};

const makeClient = (overrides: Partial<PrismaClient> = {}) => {
  const delegate = {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
  };

  return ({
    katana: {
      ...delegate,
    },
    $transaction: vi.fn(),
    ...overrides,
    __delegate: delegate,
  }) as unknown as PrismaClient & { __delegate: typeof delegate };
};

describe("katanaRepository", () => {
  it("lists katanas by owner ordered by date desc", async () => {
    const expected = [{ ...baseKatana, id: "kat_1" }];
    const client = makeClient();
    const delegate = (client as any).__delegate;
    delegate.findMany.mockResolvedValue(expected);

    const result = await katanaRepository.listByOwner("usr_owner", { client });

    expect(delegate.findMany).toHaveBeenCalledWith({
      where: { ownerId: "usr_owner" },
      orderBy: { createdAt: "desc" },
    });
    expect(result).toEqual(expected);
  });

  it("finds a katana with ownership check", async () => {
    const client = makeClient();
    const delegate = (client as any).__delegate;
    delegate.findFirst.mockResolvedValue(baseKatana);

    const result = await katanaRepository.findOwned("kat_test", "usr_owner", { client });

    expect(delegate.findFirst).toHaveBeenCalledWith({ where: { id: "kat_test", ownerId: "usr_owner" } });
    expect(result).toEqual(baseKatana);
  });

  it("throws when katana is not found for owner", async () => {
    const client = makeClient();
    const delegate = (client as any).__delegate;
    delegate.findFirst.mockResolvedValue(null);

    await expect(katanaRepository.findOwned("unknown", "usr_owner", { client })).rejects.toBeInstanceOf(KatanaNotFoundError);
  });

  it("creates a katana with trimmed name", async () => {
    const payload: KatanaCreateInput = {
      ownerId: "usr_owner",
      name: "  Nouveau  ",
      handleColor: "#222222",
      bladeTint: "#cccccc",
      metalness: 0.6,
      roughness: 0.2,
    };

    const client = makeClient();
    const delegate = (client as any).__delegate;
    delegate.create.mockResolvedValue({ ...baseKatana, ...payload, name: "Nouveau" });

    const result = await katanaRepository.create(payload, { client });

    expect(delegate.create).toHaveBeenCalledWith({
      data: { ...payload, name: "Nouveau" },
    });
    expect(result.name).toBe("Nouveau");
  });

  it("updates a katana inside a transaction and skips noop payload", async () => {
    const updated = { ...baseKatana, name: "Renomme" };
    const tx = {
      katana: {
        findFirst: vi.fn().mockResolvedValue(baseKatana),
        update: vi.fn().mockResolvedValue(updated),
      },
    };
    const client = makeClient({
      $transaction: vi.fn(async (fn) => fn(tx as any)),
    });

    const result = await katanaRepository.update("kat_test", "usr_owner", { name: "Renomme" }, { client });

    expect(client.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.katana.update).toHaveBeenCalledWith({
      where: { id: "kat_test" },
      data: { name: "Renomme" },
    });
    expect(result).toEqual(updated);
  });

  it("throws when removing non existing katana", async () => {
    const client = makeClient();
    const delegate = (client as any).__delegate;
    delegate.deleteMany.mockResolvedValue({ count: 0 });

    await expect(katanaRepository.remove("missing", "usr_owner", { client })).rejects.toBeInstanceOf(KatanaNotFoundError);
  });

  it("removes katana for owner", async () => {
    const client = makeClient();
    const delegate = (client as any).__delegate;
    delegate.deleteMany.mockResolvedValue({ count: 1 });

    await expect(katanaRepository.remove("kat_test", "usr_owner", { client })).resolves.toBeUndefined();
  });

  it("transfers ownership with checks", async () => {
    const newOwner = { ...baseKatana, ownerId: "usr_new" };
    const tx = {
      katana: {
        findFirst: vi.fn().mockResolvedValue(baseKatana),
        update: vi.fn().mockResolvedValue(newOwner),
      },
    };
    const client = makeClient({
      $transaction: vi.fn(async (fn) => fn(tx as any)),
    });

    const result = await katanaRepository.transferOwnership("kat_test", "usr_owner", "usr_new", { client });

    expect(tx.katana.findFirst).toHaveBeenCalledWith({ where: { id: "kat_test" } });
    expect(tx.katana.update).toHaveBeenCalledWith({
      where: { id: "kat_test" },
      data: { ownerId: "usr_new" },
    });
    expect(result).toEqual(newOwner);
  });

  it("throws on ownership mismatch during transfer", async () => {
    const tx = {
      katana: {
        findFirst: vi.fn().mockResolvedValue(baseKatana),
        update: vi.fn(),
      },
    };
    const client = makeClient({
      $transaction: vi.fn(async (fn) => fn(tx as any)),
    });

    await expect(katanaRepository.transferOwnership("kat_test", "wrong", "usr_new", { client })).rejects.toBeInstanceOf(KatanaOwnershipError);
    expect(tx.katana.update).not.toHaveBeenCalled();
  });

  it("wraps withTransaction around provided client", async () => {
    const tx = {} as any;
    const client = makeClient({
      $transaction: vi.fn(async (fn) => fn(tx)),
    });

    const result = await katanaRepository.withTransaction(async (inner) => {
      expect(inner).toBe(tx);
      return 42;
    }, { client });

    expect(client.$transaction).toHaveBeenCalledTimes(1);
    expect(result).toBe(42);
  });
});
