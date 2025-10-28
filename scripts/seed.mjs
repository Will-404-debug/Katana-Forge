import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dataset = {
  users: [
    {
      id: "usr_aiko",
      email: "aiko@example.com",
      name: "Aiko Tanaka",
      googleId: null,
      backgroundColor: "#040405",
    },
    {
      id: "usr_kenji",
      email: "kenji@katanalab.test",
      name: "Kenji Watanabe",
      googleId: null,
      backgroundColor: "#101010",
    },
    {
      id: "usr_claire",
      email: "claire@katanaforge.test",
      name: "Claire Dupont",
      googleId: null,
      backgroundColor: "#1f1f28",
    },
  ],
  katanas: [
    {
      id: "kat_aiko_alpha",
      ownerId: "usr_aiko",
      name: "Akai no Yume",
      handleColor: "#2b1d14",
      bladeTint: "#d7d3c8",
      metalness: 0.65,
      roughness: 0.25,
    },
    {
      id: "kat_aiko_training",
      ownerId: "usr_aiko",
      name: "Shinrin Ryu",
      handleColor: "#1d3b2f",
      bladeTint: "#f2f8ff",
      metalness: 0.72,
      roughness: 0.32,
    },
    {
      id: "kat_kenji_master",
      ownerId: "usr_kenji",
      name: "Kurohane",
      handleColor: "#1a1a1a",
      bladeTint: "#bbbbbb",
      metalness: 0.8,
      roughness: 0.28,
    },
  ],
  drafts: [
    {
      id: "drf_guest",
      ownerId: null,
      guestToken: "guest_seed_token",
      handleColor: "#362b20",
      bladeTint: "#f4ede2",
      metalness: 0.58,
      roughness: 0.35,
      quantity: 1,
    },
  ],
  katanaQuotes: [
    {
      id: "kq_demo",
      userId: "usr_aiko",
      price: 125000,
      currency: "EUR",
      estimatedDeliveryWeeks: 12,
      config: JSON.stringify({
        handleColor: "#2b1d14",
        bladeTint: "#d7d3c8",
        metalness: 0.65,
        roughness: 0.25,
      }),
    },
  ],
  customers: [
    {
      id: "cus_henri",
      email: "henri.client@example.com",
      firstName: "Henri",
      lastName: "Martin",
      phone: "+33 6 11 22 33 44",
    },
  ],
  addresses: [
    {
      id: "adr_henri_shipping",
      customerId: "cus_henri",
      type: "SHIPPING",
      company: null,
      vatNumber: null,
      line1: "12 rue des Forges",
      line2: null,
      city: "Lyon",
      postalCode: "69002",
      country: "FR",
    },
    {
      id: "adr_henri_billing",
      customerId: "cus_henri",
      type: "BILLING",
      company: "Dojo Kofun",
      vatNumber: "FR123456789",
      line1: "12 rue des Forges",
      line2: "Etage 3",
      city: "Lyon",
      postalCode: "69002",
      country: "FR",
    },
  ],
  quotes: [
    {
      id: "quo_demo",
      number: "2025-0001",
      customerId: "cus_henri",
      shippingAddrId: "adr_henri_shipping",
      billingAddrId: "adr_henri_billing",
      currency: "EUR",
      subtotalCents: 98000,
      taxCents: 19600,
      shippingCents: 4000,
      totalCents: 121600,
      status: "SENT",
      payLink: "https://example.com/pay/quo_demo",
      pdfPath: "/quotes/quo_demo.pdf",
      sentAt: new Date("2025-01-15T08:30:00.000Z"),
      consentAt: new Date("2025-01-15T09:00:00.000Z"),
      policyVersion: "2025-01",
    },
  ],
  quoteItems: [
    {
      id: "qit_blade",
      quoteId: "quo_demo",
      sku: "BLADE-01",
      name: "Lame tamahagane premium",
      qty: 1,
      unitCents: 78000,
      vatRatePct: 20,
      totalCents: 93600,
    },
    {
      id: "qit_handle",
      quoteId: "quo_demo",
      sku: "HANDLE-SILK",
      name: "Tsuka soie rouge",
      qty: 1,
      unitCents: 20000,
      vatRatePct: 20,
      totalCents: 24000,
    },
  ],
  quoteCounters: [
    {
      year: 2025,
      counter: 1,
    },
  ],
  orders: [
    {
      id: "ord_demo",
      customerId: "cus_henri",
      quoteId: "quo_demo",
      stripePaymentId: "pi_demo_123",
      currency: "EUR",
      totalCents: 121600,
      status: "PENDING",
    },
  ],
};

async function main() {
  console.info(`[seed] Target database: ${process.env.DATABASE_URL}`);

  const passwordHash = await bcrypt.hash("Katana!2025", 10);
  const usersWithHash = dataset.users.map((user, index) => ({
    ...user,
    passwordHash,
    createdAt: new Date(`2025-01-${10 + index}T10:00:00.000Z`),
    updatedAt: new Date(`2025-02-${10 + index}T12:00:00.000Z`),
  }));

  await prisma.$transaction(async (tx) => {
    await tx.quoteItem.deleteMany();
    await tx.order.deleteMany();
    await tx.quote.deleteMany();
    await tx.address.deleteMany();
    await tx.quoteCounter.deleteMany();
    await tx.customer.deleteMany();
    await tx.katana.deleteMany();
    await tx.katanaDraft.deleteMany();
    await tx.katanaQuote.deleteMany();
    await tx.user.deleteMany();
  });

  await prisma.$transaction(async (tx) => {
    for (const user of usersWithHash) {
      await tx.user.create({ data: user });
    }

    for (const katana of dataset.katanas) {
      await tx.katana.create({ data: katana });
    }

    for (const draft of dataset.drafts) {
      await tx.katanaDraft.create({ data: draft });
    }

    for (const quote of dataset.katanaQuotes) {
      await tx.katanaQuote.create({ data: quote });
    }

    for (const customer of dataset.customers) {
      await tx.customer.create({ data: customer });
    }

    for (const address of dataset.addresses) {
      await tx.address.create({ data: address });
    }

    for (const counter of dataset.quoteCounters) {
      await tx.quoteCounter.create({ data: counter });
    }

    for (const quote of dataset.quotes) {
      await tx.quote.create({ data: quote });
    }

    for (const item of dataset.quoteItems) {
      await tx.quoteItem.create({ data: item });
    }

    for (const order of dataset.orders) {
      await tx.order.create({ data: order });
    }
  });

  console.info("[seed] Dataset imported successfully.");
}

main()
  .catch((error) => {
    console.error("[seed] Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
