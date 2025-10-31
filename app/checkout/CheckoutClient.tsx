"use client";

import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { CheckoutPayloadSchema, type CheckoutPayload } from "@/lib/validation/checkout";
import { computeLineTotals, sumCents, toEuroString } from "@/lib/money";
import { csrfHeader } from "@/lib/csrf";
import { useCartStore } from "@/lib/stores/cart-store";
import AddressForm from "./components/AddressForm";
import OrderSummary from "./components/OrderSummary";

const POLICY_VERSION = "2025-01";

const INPUT_CLASS =
  "mt-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:outline-none";

type CheckoutStatus =
  | { type: "idle"; message?: string; error?: string }
  | { type: "quote" }
  | { type: "pay" };

export type LegalLink = {
  href: Route;
  label: string;
};

export type CheckoutFormValues = Omit<CheckoutPayload, "consent"> & {
  consent: boolean;
};

type Props = {
  defaultValues: CheckoutFormValues;
  legalLinks: readonly LegalLink[];
};

const CheckoutClient = ({ defaultValues, legalLinks }: Props) => {
  const methods = useForm<CheckoutFormValues>({
    resolver: zodResolver(CheckoutPayloadSchema) as Resolver<CheckoutFormValues>,
    mode: "onChange",
    defaultValues,
  });
  const cartItems = useCartStore((state) => state.items);
  const cartShippingCents = useCartStore((state) => state.shippingCents);
  const clearCart = useCartStore((state) => state.clear);

  const {
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting, isValid, errors },
  } = methods;

  const consent = useWatch({ control: methods.control, name: "consent" });
  const billSame = useWatch({ control: methods.control, name: "billSame" });
  const items = useWatch({ control: methods.control, name: "items" });
  const shippingCents = useWatch({ control: methods.control, name: "shippingCents" });
  const shippingAddress = useWatch({ control: methods.control, name: "ship" });

  useEffect(() => {
    if (cartItems.length === 0) {
      return;
    }

    setValue(
      "items",
      cartItems.map(({ id, ...item }) => item),
      { shouldValidate: true },
    );
  }, [cartItems, setValue]);

  useEffect(() => {
    if (!Number.isFinite(cartShippingCents) || shippingCents === cartShippingCents) {
      return;
    }

    setValue("shippingCents", cartShippingCents, { shouldValidate: true });
  }, [cartShippingCents, setValue, shippingCents]);

  const hasItems = items.length > 0;

  useEffect(() => {
    if (!billSame) {
      return;
    }

    if (!shippingAddress) {
      return;
    }

    setValue("bill", { ...shippingAddress }, { shouldValidate: false });
  }, [billSame, setValue, shippingAddress]);

  const [status, setStatus] = useState<CheckoutStatus>({ type: "idle" });

  const totals = useMemo(() => {
    const subtotal = items.reduce((accumulator, item) => {
      const { netCents } = computeLineTotals({
        unitCents: item.unitCents,
        qty: item.qty,
        vatRatePct: item.vatRatePct,
      });
      return accumulator + netCents;
    }, 0);

    const vatTotal = items.reduce((accumulator, item) => {
      const { taxCents } = computeLineTotals({
        unitCents: item.unitCents,
        qty: item.qty,
        vatRatePct: item.vatRatePct,
      });
      return accumulator + taxCents;
    }, 0);

    const total = sumCents(subtotal, vatTotal, shippingCents);

    return {
      subtotal,
      vat: vatTotal,
      total,
    };
  }, [items, shippingCents]);

  const onQuote = handleSubmit(async (data) => {
    setStatus({ type: "quote" });
    try {
      const payload = withMetadata(data);
      const response = await fetch("/api/checkout/quote", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          ...csrfHeader(),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body?.error ?? "Impossible de créer le devis");
      }

      const result = await response.json();
      clearCart();
      setStatus({
        type: "idle",
        message: `Devis ${result.number} envoyé. Un PDF a été expédié à ${payload.email}.`,
      });
    } catch (error) {
      setStatus({
        type: "idle",
        error: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    }
  });

  const onPay = handleSubmit(async (data) => {
    setStatus({ type: "pay" });
    try {
      const payload = withMetadata(data);
      const response = await fetch("/api/checkout/pay", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          ...csrfHeader(),
        },
        body: JSON.stringify({
          email: payload.email,
          items: payload.items,
          shippingCents: payload.shippingCents,
        }),
      });

      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body?.error ?? "Impossible d’initier le paiement");
      }

      const result = await response.json();
      if (result?.url) {
        window.location.href = result.url as string;
        return;
      }

      throw new Error("URL de paiement indisponible");
    } catch (error) {
      setStatus({
        type: "idle",
        error: error instanceof Error ? error.message : "Une erreur est survenue",
      });
    }
  });

  const disabled = !hasItems || !consent || !isValid || isSubmitting || status.type !== "idle";

  return (
    <FormProvider {...methods}>
      <form
        className="grid gap-8 rounded-lg border border-neutral-200 bg-white p-6 shadow-sm md:grid-cols-[minmax(0,1fr),360px] md:gap-10"
        onSubmit={(event) => event.preventDefault()}
        noValidate
      >
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Adresse de livraison</h2>
            <p className="text-sm text-neutral-600">
              Ces informations seront utilisées pour expédier votre commande et vous contacter.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700" htmlFor="firstName">
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                {...methods.register("firstName")}
                className={INPUT_CLASS}
                autoComplete="given-name"
              />
              {errors.firstName ? (
                <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700" htmlFor="lastName">
                Nom
              </label>
              <input
                id="lastName"
                type="text"
                {...methods.register("lastName")}
                className={INPUT_CLASS}
                autoComplete="family-name"
              />
              {errors.lastName ? (
                <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...methods.register("email")}
                className={INPUT_CLASS}
                autoComplete="email"
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-neutral-700" htmlFor="phone">
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                {...methods.register("phone")}
                className={INPUT_CLASS}
                autoComplete="tel"
              />
              {errors.phone ? (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              ) : null}
            </div>
          </div>

          <AddressForm prefix="ship" />

          <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-700">
                Adresse de facturation
              </span>
              <span className="text-xs text-neutral-500">
                Cochez si l’adresse de facturation est identique à la livraison.
              </span>
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
              <input type="checkbox" {...methods.register("billSame")} />
              Identique à la livraison
            </label>
          </div>

          {!billSame ? <AddressForm prefix="bill" /> : null}

          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            <p>
              Sous-total HT : {toEuroString(totals.subtotal)} • TVA estimée :{" "}
              {toEuroString(totals.vat)} • Total TTC : {toEuroString(totals.total)}
            </p>
          </div>
        </section>

        <aside className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
          <OrderSummary items={items} shippingCents={shippingCents} />

          <fieldset className="space-y-2 rounded-md border border-neutral-200 bg-white p-4">
            <legend className="text-sm font-semibold text-neutral-700">
              Consentement RGPD
            </legend>

            <label className="flex items-start gap-3 text-sm text-neutral-700">
              <input type="checkbox" {...methods.register("consent")} />
              <span>
                Je consens au traitement de mes données conformément à la{" "}
                <Link href="/legal/privacy" className="underline">
                  Politique de confidentialité
                </Link>{" "}
                et aux{" "}
                <Link href="/legal/terms" className="underline">
                  Conditions d’utilisation
                </Link>
                .
              </span>
            </label>
            {errors.consent ? (
              <p className="text-sm text-red-600">{errors.consent.message}</p>
            ) : null}

            <ul className="text-xs text-neutral-500">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </fieldset>

          {status.type === "idle" && status.message ? (
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
              {status.message}
            </div>
          ) : null}
          {status.type === "idle" && status.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {status.error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => onQuote()}
              disabled={disabled}
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {status.type === "quote" ? "Envoi du devis…" : "Demander un devis"}
            </button>
            <button
              type="button"
              onClick={() => onPay()}
              disabled={disabled}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {status.type === "pay" ? "Redirection en cours…" : "Payer maintenant"}
            </button>
          </div>
        </aside>
      </form>
    </FormProvider>
  );
};

export default CheckoutClient;

const withMetadata = (payload: CheckoutFormValues): CheckoutPayload => ({
  ...payload,
  consent: true,
  consentAt: new Date().toISOString(),
  policyVersion: POLICY_VERSION,
});

const safeJson = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};
