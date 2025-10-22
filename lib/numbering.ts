import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type QuoteNumberAllocation = {
  number: string;
  counter: number;
  year: number;
};

export const allocateQuoteNumber = async (
  tx?: Prisma.TransactionClient,
): Promise<QuoteNumberAllocation> => {
  const now = new Date();
  const year = now.getFullYear();

  const run = async (client: Prisma.TransactionClient): Promise<QuoteNumberAllocation> => {
    const counterRow = await client.quoteCounter.upsert({
      where: { year },
      create: { year, counter: 1 },
      update: { counter: { increment: 1 } },
    });

    const { counter } = counterRow;
    if (!Number.isSafeInteger(counter) || counter <= 0) {
      throw new Error("Quote counter produced invalid value");
    }

    return {
      number: formatNumber(year, counter),
      counter,
      year,
    };
  };

  if (tx) {
    return run(tx);
  }

  return prisma.$transaction((client) => run(client));
};

const formatNumber = (year: number, counter: number) =>
  `Q-${year}-${counter.toString().padStart(6, "0")}`;
