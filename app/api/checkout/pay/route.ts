import { NextResponse } from "next/server";

import { PayNowPayloadSchema } from "@/lib/validation/checkout";
import { recalculateTotals } from "@/lib/checkout/pricing";
import { getStripe } from "@/lib/stripe";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const parsed = PayNowPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const { lines, totals } = recalculateTotals({
    items: data.items,
    shippingCents: data.shippingCents ?? 0,
  });

  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: data.email,
    metadata: {
      origin: "direct",
    },
    success_url: `${APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_URL}/checkout`,
    line_items: [
      ...lines.map((line) => {
        const vatPerUnit = Math.round(line.unitCents * (line.vatRatePct / 100));
        const unitAmount = line.unitCents + vatPerUnit;

        return {
          quantity: line.qty,
          price_data: {
            currency: "eur",
            unit_amount: unitAmount,
            product_data: {
              name: line.name,
              metadata: {
                sku: line.sku,
                vatRate: `${line.vatRatePct}`,
              },
            },
          },
        };
      }),
      ...(totals.shippingCents > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: totals.shippingCents,
                product_data: {
                  name: "Frais de livraison",
                },
              },
            },
          ]
        : []),
    ],
  });

  return NextResponse.json({ url: session.url });
}
