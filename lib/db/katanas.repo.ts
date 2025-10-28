import { Prisma, PrismaClient, Katana } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export class KatanaNotFoundError extends Error {
  constructor(message = "Katana introuvable") {
    super(message);
    this.name = "KatanaNotFoundError";
  }
}

export class KatanaOwnershipError extends Error {
  constructor(message = "Operation non autorisee sur ce katana") {
    super(message);
    this.name = "KatanaOwnershipError";
  }
}

type TransactionClient = Prisma.TransactionClient;
type KatanaClient = PrismaClient | TransactionClient;

const getClient = (client?: KatanaClient): KatanaClient => client ?? prisma;
const isPrismaClient = (client: KatanaClient): client is PrismaClient => typeof (client as PrismaClient).$transaction === "function";
const runWithTransaction = async <T>(client: KatanaClient, handler: (tx: TransactionClient) => Promise<T>): Promise<T> => {
  if (isPrismaClient(client)) {
    return client.$transaction(handler);
  }
  return handler(client);
};

export type KatanaCreateInput = Pick<Katana, "name" | "handleColor" | "bladeTint" | "metalness" | "roughness"> & {
  ownerId: string;
};

export type KatanaUpdateInput = Partial<Pick<Katana, "name" | "handleColor" | "bladeTint" | "metalness" | "roughness">>;

export const katanaRepository = {
  async listByOwner(ownerId: string, options: { client?: KatanaClient } = {}): Promise<Katana[]> {
    const client = getClient(options.client);

    return client.katana.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findOwned(id: string, ownerId: string, options: { client?: KatanaClient } = {}): Promise<Katana> {
    const client = getClient(options.client);
    const katana = await client.katana.findFirst({ where: { id, ownerId } });

    if (!katana) {
      throw new KatanaNotFoundError();
    }

    return katana;
  },

  async create(data: KatanaCreateInput, options: { client?: KatanaClient } = {}): Promise<Katana> {
    const client = getClient(options.client);

    return client.katana.create({
      data: {
        ownerId: data.ownerId,
        name: data.name.trim(),
        handleColor: data.handleColor,
        bladeTint: data.bladeTint,
        metalness: data.metalness,
        roughness: data.roughness,
      },
    });
  },

  async update(id: string, ownerId: string, data: KatanaUpdateInput, options: { client?: KatanaClient } = {}): Promise<Katana> {
    const client = getClient(options.client);

    return runWithTransaction(client, async (tx) => {
      const existing = await tx.katana.findFirst({ where: { id, ownerId } });

      if (!existing) {
        throw new KatanaNotFoundError();
      }

      const payload: KatanaUpdateInput = {};
      if (typeof data.name === "string") {
        payload.name = data.name.trim();
      }
      if (typeof data.handleColor === "string") {
        payload.handleColor = data.handleColor;
      }
      if (typeof data.bladeTint === "string") {
        payload.bladeTint = data.bladeTint;
      }
      if (typeof data.metalness === "number") {
        payload.metalness = data.metalness;
      }
      if (typeof data.roughness === "number") {
        payload.roughness = data.roughness;
      }

      if (Object.keys(payload).length === 0) {
        return existing;
      }

      return tx.katana.update({
        where: { id },
        data: payload,
      });
    });
  },

  async remove(id: string, ownerId: string, options: { client?: KatanaClient } = {}): Promise<void> {
    const client = getClient(options.client);

    const result = await client.katana.deleteMany({ where: { id, ownerId } });

    if (result.count === 0) {
      throw new KatanaNotFoundError();
    }
  },

  async transferOwnership(id: string, currentOwnerId: string, newOwnerId: string, options: { client?: KatanaClient } = {}): Promise<Katana> {
    const client = getClient(options.client);

    return runWithTransaction(client, async (tx) => {
      const existing = await tx.katana.findFirst({ where: { id } });

      if (!existing) {
        throw new KatanaNotFoundError();
      }

      if (existing.ownerId !== currentOwnerId) {
        throw new KatanaOwnershipError();
      }

      return tx.katana.update({
        where: { id },
        data: { ownerId: newOwnerId },
      });
    });
  },

  async withTransaction<T>(handler: (tx: TransactionClient) => Promise<T>, options: { client?: PrismaClient } = {}) {
    const client = (options.client ?? prisma) as PrismaClient;
    return client.$transaction(handler);
  },
};
