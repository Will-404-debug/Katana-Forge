import { NextResponse } from "next/server";
import { katanaConfigSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

const BASE_PRICE = Number(process.env.BASE_PRICE ?? 420);

type KatanaQuoteResponse = {
  price: number;
  currency: "EUR";
  estimatedDeliveryWeeks: number;
};

type ErrorResponse = {
  error: string;
};

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  let payload: unknown;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json<ErrorResponse>({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const parsed = katanaConfigSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json<ErrorResponse>(
      { error: "Configuration invalide" },
      { status: 422 },
    );
  }

  const config = parsed.data;

  const price = Math.round(BASE_PRICE + config.metalness * 50 + config.roughness * 35);
  const estimatedDeliveryWeeks = 4 + Math.round(config.metalness * 2 + config.roughness * 1.5);

  const response: KatanaQuoteResponse = {
    price,
    currency: "EUR",
    estimatedDeliveryWeeks,
  };

  const legacyClient = prisma as typeof prisma & {
    katanaQuote?: {
      create: (args: {
        data: {
          userId?: string | null;
          price: number;
          currency: string;
          estimatedDeliveryWeeks: number;
          config: string;
        };
      }) => Promise<unknown>;
    };
  };

  try {
    if (legacyClient.katanaQuote?.create) {
      await legacyClient.katanaQuote.create({
        data: {
          userId: user?.id,
          price,
          currency: response.currency,
          estimatedDeliveryWeeks,
          config: JSON.stringify(config),
        },
      });
    }
  } catch (error) {
    console.warn("Unable to persist legacy katana quote", error);
  }

  return NextResponse.json(response, { status: 200 });
}
