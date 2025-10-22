import Link from "next/link";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import type { CheckoutPayload } from "@/lib/validation/checkout";
import CheckoutClient from "./CheckoutClient";

const DEFAULT_VAT_RATE = 20;
const DEFAULT_SHIPPING_CENTS = 2500;
const LEGAL_LINKS = [
  { href: "/legal/imprint", label: "Mentions légales" },
  { href: "/legal/terms", label: "Conditions d’utilisation" },
  { href: "/legal/privacy", label: "Politique de confidentialité" },
  { href: "/legal/refund", label: "Politique de remboursement" },
  { href: "/legal/shipping", label: "Conditions de livraison" },
] as const;

const BASE_PRICE = Number.parseFloat(process.env.BASE_PRICE ?? "420");

export default async function CheckoutPage() {
  const initialValues = await buildInitialValues();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-semibold">Finaliser votre commande</h1>
        <p className="mt-2 text-neutral-600">
          Renseignez vos informations, validez le consentement RGPD et choisissez entre devis
          signé ou paiement sécurisé Stripe.
        </p>
      </header>

      <CheckoutClient defaultValues={initialValues} legalLinks={LEGAL_LINKS} />

      <footer className="rounded-lg border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-600">
        <p>
          En poursuivant, vous acceptez nos{" "}
          <Link href="/legal/terms" className="underline">
            Conditions d’utilisation
          </Link>{" "}
          et reconnaissez avoir lu notre{" "}
          <Link href="/legal/privacy" className="underline">
            Politique de confidentialité
          </Link>
          . Les informations sont traitées conformément aux exigences RGPD.
        </p>
      </footer>
    </div>
  );
}

const buildInitialValues = async (): Promise<CheckoutPayload> => {
  const user = await getAuthenticatedUser();
  const draft = await findActiveDraft(user?.id);
  const items = draft ? [draftToItem(draft)] : [defaultItem()];

  const emptyAddress = {
    company: "",
    vatNumber: "",
    line1: "",
    line2: "",
    city: "",
    postalCode: "",
    country: "FR" as const,
  };

  return {
    email: user?.email ?? "",
    firstName: "",
    lastName: "",
    phone: "",
    ship: emptyAddress,
    billSame: true,
    bill: emptyAddress,
    items,
    shippingCents: DEFAULT_SHIPPING_CENTS,
    consent: false,
    consentAt: undefined,
    policyVersion: undefined,
  };
};

const findActiveDraft = async (userId?: string | null) => {
  if (userId) {
    return prisma.katanaDraft.findFirst({
      where: { ownerId: userId },
    });
  }

  const draftToken = cookies().get("draft_id")?.value;
  if (!draftToken) {
    return null;
  }

  return prisma.katanaDraft.findFirst({
    where: { guestToken: draftToken },
  });
};

const draftToItem = (draft: { id: string; quantity: number; metalness: number; roughness: number }) => {
  const euros =
    BASE_PRICE +
    Number.parseFloat(draft.metalness.toFixed(2)) * 50 +
    Number.parseFloat(draft.roughness.toFixed(2)) * 35;
  const unitCents = Math.max(Math.round(euros * 100), 0);

  return {
    sku: `KATANA-${draft.id.slice(0, 6).toUpperCase()}`,
    name: "Katana forgé sur mesure",
    qty: Math.max(draft.quantity, 1),
    unitCents,
    vatRatePct: DEFAULT_VAT_RATE,
  };
};

const defaultItem = () => ({
  sku: "KATANA-BASE",
  name: "Katana forgé sur mesure",
  qty: 1,
  unitCents: Math.round(BASE_PRICE * 100),
  vatRatePct: DEFAULT_VAT_RATE,
});
