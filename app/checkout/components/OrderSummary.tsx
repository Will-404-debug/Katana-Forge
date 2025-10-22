"use client";

import { useMemo } from "react";

import { computeLineTotals, sumCents, toEuroString } from "@/lib/money";
import type { CheckoutItemInput } from "@/lib/validation/checkout";

type Props = {
  items: CheckoutItemInput[];
  shippingCents: number;
  currency?: string;
};

const OrderSummary = ({ items, shippingCents, currency = "EUR" }: Props) => {
  const summary = useMemo(() => {
    const rows = items.map((item) => {
      const totals = computeLineTotals({
        unitCents: item.unitCents,
        qty: item.qty,
        vatRatePct: item.vatRatePct,
      });
      return { item, totals };
    });

    const subtotal = rows.reduce((acc, row) => acc + row.totals.netCents, 0);
    const vat = rows.reduce((acc, row) => acc + row.totals.taxCents, 0);
    const total = sumCents(subtotal, vat, shippingCents);

    return { rows, subtotal, vat, total };
  }, [items, shippingCents]);

  if (items.length === 0) {
    return (
      <div className="rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        Votre panier est vide. Ajoutez un modèle de katana avant de poursuivre.
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-md border border-neutral-200 bg-white p-4">
      <header>
        <h2 className="text-lg font-semibold text-neutral-800">Récapitulatif</h2>
        <p className="text-xs text-neutral-500">
          Montants en {currency}. Les prix seront recalculés côté serveur avant confirmation.
        </p>
      </header>

      <ul className="space-y-3 text-sm">
        {summary.rows.map(({ item, totals }) => (
          <li
            key={`${item.sku}-${item.vatRatePct}`}
            className="flex flex-col gap-1 rounded-md border border-neutral-100 bg-neutral-50 p-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-neutral-800">{item.name}</p>
                <p className="text-xs text-neutral-500">SKU: {item.sku}</p>
              </div>
              <span className="text-sm font-semibold text-neutral-800">
                {toEuroString(totals.grossCents)}
              </span>
            </div>
            <div className="text-xs text-neutral-600">
              <span>
                Qté {item.qty} • PU HT {toEuroString(item.unitCents)} • TVA {item.vatRatePct}%
              </span>
            </div>
          </li>
        ))}
      </ul>

      <dl className="space-y-1 text-sm text-neutral-700">
        <div className="flex justify-between">
          <dt>Sous-total HT</dt>
          <dd>{toEuroString(summary.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>TVA</dt>
          <dd>{toEuroString(summary.vat)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Livraison</dt>
          <dd>{toEuroString(shippingCents)}</dd>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-semibold text-neutral-900">
          <dt>Total TTC</dt>
          <dd>{toEuroString(summary.total)}</dd>
        </div>
      </dl>
    </section>
  );
};

export default OrderSummary;
