import { NextResponse } from "next/server";
import type StripeType from "stripe";

import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook non configuré" },
      { status: 500 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: StripeType.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, WEBHOOK_SECRET);
  } catch (error) {
    return NextResponse.json(
      { error: "Signature invalide", details: String(error) },
      { status: 400 },
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as StripeType.Checkout.Session;
      await handleCheckoutCompleted(session);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

const handleCheckoutCompleted = async (session: StripeType.Checkout.Session) => {
  if (session.metadata?.quoteId) {
    await convertQuote(session.metadata.quoteId, session);
    return;
  }

  await recordDirectOrder(session);
};

const convertQuote = async (quoteId: string, session: StripeType.Checkout.Session) => {
  const paymentId = resolvePaymentId(session);

  await prisma.$transaction(async (tx) => {
    const quote = await tx.quote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      return;
    }

    const existingOrder = await tx.order.findFirst({
      where: { quoteId },
    });

    if (existingOrder) {
      await tx.order.update({
        where: { id: existingOrder.id },
        data: {
          status: "PAID",
          stripePaymentId: paymentId,
        },
      });
      await tx.quote.update({
        where: { id: quoteId },
        data: { status: "CONVERTED" },
      });
      return;
    }

    await tx.quote.update({
      where: { id: quoteId },
      data: { status: "CONVERTED" },
    });

    await tx.order.create({
      data: {
        customerId: quote.customerId,
        quoteId: quote.id,
        stripePaymentId: paymentId,
        currency: quote.currency,
        totalCents: quote.totalCents,
        status: "PAID",
      },
    });
  });
};

const recordDirectOrder = async (session: StripeType.Checkout.Session) => {
  const email =
    session.customer_details?.email ??
    session.customer_email ??
    session.metadata?.email;

  if (!email) {
    return;
  }

  const name = session.customer_details?.name ?? "";
  const [firstName, lastName] = splitName(name);

  const paymentId = resolvePaymentId(session);
  const currency = session.currency?.toUpperCase() ?? "EUR";
  const totalCents = session.amount_total ?? 0;

  await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email: email.toLowerCase() },
      update: {
        firstName: firstName || "Client",
        lastName: lastName || "Stripe",
      },
      create: {
        email: email.toLowerCase(),
        firstName: firstName || "Client",
        lastName: lastName || "Stripe",
      },
    });

    const existingOrder = await tx.order.findFirst({
      where: { stripePaymentId: paymentId },
    });

    if (existingOrder) {
      await tx.order.update({
        where: { id: existingOrder.id },
        data: {
          status: "PAID",
          totalCents,
          currency,
        },
      });
      return;
    }

    await tx.order.create({
      data: {
        customerId: customer.id,
        stripePaymentId: paymentId,
        currency,
        totalCents,
        status: "PAID",
      },
    });
  });
};

const resolvePaymentId = (session: StripeType.Checkout.Session) =>
  (typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id) ?? session.id;

const splitName = (value: string): [string, string] => {
  if (!value.trim()) {
    return ["", ""];
  }

  const parts = value.trim().split(/\s+/);
  const firstName = parts.shift() ?? "";
  const lastName = parts.join(" ");
  return [firstName, lastName];
};
