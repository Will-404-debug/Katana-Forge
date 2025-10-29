import { config as dotenvConfig } from "dotenv";
import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import Stripe from "stripe";

import { PrismaClient } from "@prisma/client";

dotenvConfig({ path: ".env.local" });
dotenvConfig();

const prisma = new PrismaClient();
const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
const mailhogUrl = process.env.MAILHOG_URL ?? "http://localhost:8025";

test.afterAll(async () => {
  await prisma.$disconnect();
});

test("RGPD consent is required before enabling quote actions", async ({ page }) => {
  await page.goto("/checkout");

  const quoteButton = page.getByRole("button", { name: "Demander un devis" });
  const payButton = page.getByRole("button", { name: "Payer maintenant" });

  await expect(quoteButton).toBeDisabled();
  await expect(payButton).toBeDisabled();

  await page.fill("#firstName", "Test");
  await page.fill("#lastName", "Utilisateur");
  await page.fill("#email", "test.consent@example.com");
  await page.fill("#phone", "+33123456789");
  await page.fill("#ship-line1", "10 Rue du Sabre");
  await page.fill("#ship-postalCode", "75000");
  await page.fill("#ship-city", "Paris");

  await expect(quoteButton).toBeDisabled();
  await expect(payButton).toBeDisabled();

  await page.locator('input[name="consent"]').check();

  await expect(quoteButton).toBeEnabled();
  await expect(payButton).toBeEnabled();
});

test("Quote API sends PDF via MailHog when infrastructure is available", async ({ page }) => {
  test.skip(!stripeSecret || !webhookSecret, "Stripe not configured for quote flow test");

  let mailhogAvailable = true;
  try {
    const health = await page.request.get(`${mailhogUrl}/api/v2/messages`);
    if (!health.ok()) {
      mailhogAvailable = false;
    }
  } catch {
    mailhogAvailable = false;
  }

  test.skip(!mailhogAvailable, `MailHog not reachable at ${mailhogUrl}`);

  await page.request.delete(`${mailhogUrl}/api/v1/messages`);

  await page.goto("/checkout");
  const email = `playwright-quote-${randomUUID()}@example.com`;

  await fillCheckoutForm(page, {
    firstName: "Playwright",
    lastName: "Quote",
    email,
    phone: "+33123456789",
  });

  await page.locator('input[name="consent"]').check();

  await page.getByRole("button", { name: "Demander un devis" }).click();

  await expect(page.locator("text=/Devis .* envoyé/")).toBeVisible({ timeout: 15000 });

  const response = await page.request.get(
    `${mailhogUrl}/api/v2/search?kind=to&query=${encodeURIComponent(email)}`,
  );
  expect(response.ok()).toBeTruthy();

  const body = (await response.json()) as { total: number; items: Array<{ Content: { Headers: Record<string, string[]> }; MIME: { Parts: Array<{ Headers: Record<string, string[]> }> } }> };
  expect(body.total).toBeGreaterThan(0);

  const firstMessage = body.items[0];
  const subject = firstMessage.Content.Headers.Subject?.[0] ?? "";
  expect(subject).toContain("devis");

  const parts = firstMessage.MIME.Parts ?? [];
  const hasPdf = parts.some((part) => {
    const type = part.Headers["Content-Type"]?.[0] ?? "";
    return type.includes("application/pdf");
  });

  expect(hasPdf).toBeTruthy();

  const persistedQuote = await prisma.quote.findFirst({
    where: {
      customer: {
        email: email.toLowerCase(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (persistedQuote) {
    await prisma.order.deleteMany({ where: { quoteId: persistedQuote.id } });
    await prisma.quoteItem.deleteMany({ where: { quoteId: persistedQuote.id } });
    await prisma.quote.delete({ where: { id: persistedQuote.id } });
    await prisma.address.deleteMany({ where: { customerId: persistedQuote.customerId } });
    await prisma.customer.delete({ where: { id: persistedQuote.customerId } });
  }
});

test("Stripe webhook converts quotes to paid orders", async ({ request }) => {
  test.skip(!webhookSecret, "STRIPE_WEBHOOK_SECRET not configured");

  const customer = await prisma.customer.create({
    data: {
      email: `webhook-${randomUUID()}@example.com`,
      firstName: "Webhook",
      lastName: "Customer",
    },
  });

  const shipping = await prisma.address.create({
    data: {
      customerId: customer.id,
      type: "SHIPPING",
      line1: "1 Rue de la Forge",
      city: "Paris",
      postalCode: "75000",
      country: "FR",
    },
  });

  const billing = await prisma.address.create({
    data: {
      customerId: customer.id,
      type: "BILLING",
      line1: "1 Rue de la Forge",
      city: "Paris",
      postalCode: "75000",
      country: "FR",
    },
  });

  const quote = await prisma.quote.create({
    data: {
      number: `Q-TEST-${randomUUID().slice(0, 6)}`,
      customerId: customer.id,
      shippingAddrId: shipping.id,
      billingAddrId: billing.id,
      currency: "EUR",
      subtotalCents: 10000,
      taxCents: 2000,
      shippingCents: 1500,
      totalCents: 13500,
      status: "SENT",
    },
  });

  await prisma.quoteItem.create({
    data: {
      quoteId: quote.id,
      sku: "TEST-SKU",
      name: "Katana test",
      qty: 1,
      unitCents: 10000,
      vatRatePct: 20,
      totalCents: 12000,
    },
  });

  const payload = JSON.stringify({
    id: `evt_${randomUUID()}`,
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: `cs_${randomUUID()}`,
        object: "checkout.session",
        metadata: {
          quoteId: quote.id,
        },
        payment_intent: `pi_${randomUUID()}`,
        amount_total: quote.totalCents,
        currency: "eur",
      },
    },
  });

  const signature = Stripe.webhooks.generateTestHeaderString({
    payload,
    secret: webhookSecret,
  });

  const response = await request.post("/api/stripe/webhook", {
    headers: {
      "stripe-signature": signature,
      "content-type": "application/json",
    },
    data: payload,
  });

  expect(response.ok()).toBeTruthy();

  const updatedQuote = await prisma.quote.findUnique({ where: { id: quote.id } });
  expect(updatedQuote?.status).toBe("CONVERTED");

  const order = await prisma.order.findFirst({ where: { quoteId: quote.id } });
  expect(order).not.toBeNull();
  expect(order?.status).toBe("PAID");
  expect(order?.totalCents).toBe(quote.totalCents);

  await prisma.order.deleteMany({ where: { quoteId: quote.id } });
  await prisma.quoteItem.deleteMany({ where: { quoteId: quote.id } });
  await prisma.quote.delete({ where: { id: quote.id } });
  await prisma.address.delete({ where: { id: billing.id } });
  await prisma.address.delete({ where: { id: shipping.id } });
  await prisma.customer.delete({ where: { id: customer.id } });
});

const fillCheckoutForm = async (
  page: Page,
  data: { firstName: string; lastName: string; email: string; phone: string },
) => {
  await page.fill("#firstName", data.firstName);
  await page.fill("#lastName", data.lastName);
  await page.fill("#email", data.email);
  await page.fill("#phone", data.phone);
  await page.fill("#ship-line1", "10 Rue du Sabre");
  await page.fill("#ship-postalCode", "75000");
  await page.fill("#ship-city", "Paris");
};
