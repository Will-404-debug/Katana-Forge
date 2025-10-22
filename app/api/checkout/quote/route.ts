import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { CheckoutPayloadSchema } from "@/lib/validation/checkout";
import { recalculateTotals } from "@/lib/checkout/pricing";
import { allocateQuoteNumber } from "@/lib/numbering";
import { renderQuotePdf } from "@/lib/quote-pdf";
import { storeQuotePdf } from "@/lib/storage";
import { sendMail } from "@/lib/mailer";
import { getStripe } from "@/lib/stripe";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const STRIPE_SUCCESS_PATH = "/checkout/success";
const STRIPE_CANCEL_PATH = "/checkout";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON invalide" }, { status: 400 });
  }

  const parsed = CheckoutPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload invalide", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const data = parsed.data;
  try {
    const { lines, totals } = recalculateTotals({
      items: data.items,
      shippingCents: data.shippingCents,
    });

    const consentAt = data.consentAt ? new Date(data.consentAt) : new Date();
    const billingInput = data.billSame ? data.ship : data.bill ?? data.ship;

    const transactionResult = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { email: data.email.toLowerCase() },
        update: {
          firstName: data.firstName,
          lastName: data.lastName,
        phone: data.phone,
      },
      create: {
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });

    const shippingAddress = await tx.address.create({
      data: {
        customerId: customer.id,
        type: "SHIPPING",
        company: data.ship.company,
        vatNumber: data.ship.vatNumber,
        line1: data.ship.line1,
        line2: data.ship.line2,
        city: data.ship.city,
        postalCode: data.ship.postalCode,
        country: data.ship.country,
      },
    });

    const billingAddress = await tx.address.create({
      data: {
        customerId: customer.id,
        type: "BILLING",
        company: billingInput.company,
        vatNumber: billingInput.vatNumber,
        line1: billingInput.line1,
        line2: billingInput.line2,
        city: billingInput.city,
        postalCode: billingInput.postalCode,
        country: billingInput.country,
      },
    });

    const allocation = await allocateQuoteNumber(tx);

    const quote = await tx.quote.create({
      data: {
        number: allocation.number,
        customerId: customer.id,
        shippingAddrId: shippingAddress.id,
        billingAddrId: billingAddress.id,
        currency: "EUR",
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
        status: "DRAFT",
        consentAt,
        policyVersion: data.policyVersion,
      },
    });

    await tx.quoteItem.createMany({
      data: lines.map((line) => ({
        quoteId: quote.id,
        sku: line.sku,
        name: line.name,
        qty: line.qty,
        unitCents: line.unitCents,
        vatRatePct: line.vatRatePct,
        totalCents: line.grossCents,
      })),
    });

    return {
      customer,
      quote,
      shippingAddress,
      billingAddress,
      allocation,
    };
    });

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      metadata: {
        quoteId: transactionResult.quote.id,
      },
      success_url: `${APP_URL}${STRIPE_SUCCESS_PATH}?session_id={CHECKOUT_SESSION_ID}&quote=${transactionResult.quote.id}`,
      cancel_url: `${APP_URL}${STRIPE_CANCEL_PATH}`,
      line_items: [
        ...lines.map((line) => {
          const vatPerUnit = Math.round(line.unitCents * (line.vatRatePct / 100));
          const unitAmount = line.unitCents + vatPerUnit;

          return {
            quantity: line.qty,
            price_data: {
              currency: transactionResult.quote.currency.toLowerCase(),
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
        {
          quantity: 1,
          price_data: {
            currency: transactionResult.quote.currency.toLowerCase(),
            unit_amount: totals.shippingCents,
            product_data: {
              name: "Frais de livraison",
            },
          },
        },
      ],
    });

    if (!session.url) {
      throw new Error("Stripe session URL manquante");
    }

    const pdfBuffer = await renderQuotePdf({
      number: transactionResult.quote.number,
      issueDate: new Date(),
      customer: {
        email: data.email,
        phone: data.phone,
        shipping: {
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.ship.company,
          vatNumber: data.ship.vatNumber,
          line1: data.ship.line1,
          line2: data.ship.line2,
          postalCode: data.ship.postalCode,
          city: data.ship.city,
          country: data.ship.country,
        },
        billing: {
          firstName: data.firstName,
          lastName: data.lastName,
          company: billingInput.company,
          vatNumber: billingInput.vatNumber,
          line1: billingInput.line1,
          line2: billingInput.line2,
          postalCode: billingInput.postalCode,
          city: billingInput.city,
          country: billingInput.country,
        },
      },
      company: resolveCompany(),
      items: lines.map((line) => ({
        sku: line.sku,
        name: line.name,
        qty: line.qty,
        unitCents: line.unitCents,
        vatRatePct: line.vatRatePct,
        totalCents: line.grossCents,
      })),
      totals: {
        currency: transactionResult.quote.currency,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        shippingCents: totals.shippingCents,
        totalCents: totals.totalCents,
      },
      payLink: session.url,
    });

    const stored = await storeQuotePdf({
      quoteNumber: transactionResult.quote.number,
      buffer: pdfBuffer,
    });

    await prisma.quote.update({
      where: { id: transactionResult.quote.id },
      data: {
        payLink: session.url,
        pdfPath: stored.relativePath,
        status: "SENT",
        sentAt: new Date(),
      },
    });

    await sendMail({
      to: data.email,
      subject: `Votre devis ${transactionResult.quote.number}`,
      html: buildHtmlEmail({
        name: `${data.firstName} ${data.lastName}`,
        quoteNumber: transactionResult.quote.number,
        payLink: session.url,
      }),
      text: buildTextEmail({
        name: `${data.firstName} ${data.lastName}`,
        quoteNumber: transactionResult.quote.number,
        payLink: session.url,
      }),
      attachments: [
        {
          filename: `${transactionResult.quote.number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
      tags: {
        quoteId: transactionResult.quote.id,
      },
    });

    return NextResponse.json({
      ok: true,
      quoteId: transactionResult.quote.id,
      number: transactionResult.quote.number,
    });
  } catch (error) {
    console.error("Quote creation failed", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du devis" },
      { status: 500 },
    );
  }
}

const resolveCompany = () => {
  const fromAddress = parseMailFrom(process.env.MAIL_FROM ?? "Katana Forge <no-reply@kfor.ge>");
  const addressLines =
    process.env.COMPANY_ADDRESS?.split("|") ?? ["123 Rue du Sabre", "75000 Paris", "France"];

  return {
    name: process.env.COMPANY_NAME ?? "Katana Forge",
    siret: process.env.COMPANY_SIRET ?? "000 000 000 00000",
    vatNumber: process.env.COMPANY_VAT ?? "FRXX999999999",
    addressLines,
    email: fromAddress,
    phone: process.env.COMPANY_PHONE ?? "+33 1 23 45 67 89",
    website: process.env.COMPANY_WEBSITE ?? APP_URL,
  };
};

const parseMailFrom = (value: string) => {
  const match = value.match(/<([^>]+)>/);
  if (match) {
    return match[1];
  }
  return value;
};

const buildHtmlEmail = ({ name, quoteNumber, payLink }: { name: string; quoteNumber: string; payLink: string }) => `
  <p>Bonjour ${name},</p>
  <p>Merci pour votre intérêt pour Katana Forge. Vous trouverez ci-joint le devis <strong>${quoteNumber}</strong>.</p>
  <p>Vous pouvez régler en ligne via Stripe en cliquant sur le lien suivant :</p>
  <p><a href="${payLink}">Payer ce devis</a></p>
  <p>Restant à votre disposition pour toute question.</p>
  <p>L’équipe Katana Forge</p>
`;

const buildTextEmail = ({ name, quoteNumber, payLink }: { name: string; quoteNumber: string; payLink: string }) =>
  [
    `Bonjour ${name},`,
    ``,
    `Merci pour votre intérêt pour Katana Forge.`,
    `Vous trouverez ci-joint le devis ${quoteNumber}.`,
    `Payer ce devis : ${payLink}`,
    ``,
    `L’équipe Katana Forge`,
  ].join("\n");
