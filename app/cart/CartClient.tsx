"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import { CART_MAX_ITEM_QTY, useCartStore } from "@/lib/stores/cart-store";
import { computeLineTotals, sumCents, toEuroString } from "@/lib/money";
import { useSession } from "@/lib/use-session";

const CartClient = () => {
  const router = useRouter();
  const { isAuthenticated, status } = useSession();

  const items = useCartStore((state) => state.items);
  const shippingCents = useCartStore((state) => state.shippingCents);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  const summary = useMemo(() => {
    const lines = items.map((item) => ({
      item,
      totals: computeLineTotals({
        unitCents: item.unitCents,
        qty: item.qty,
        vatRatePct: item.vatRatePct,
      }),
    }));

    const subtotal = lines.reduce((acc, line) => acc + line.totals.netCents, 0);
    const vat = lines.reduce((acc, line) => acc + line.totals.taxCents, 0);
    const total = sumCents(subtotal, vat, shippingCents);

    return { lines, subtotal, vat, total };
  }, [items, shippingCents]);

  const handleQuantityChange = (id: string, value: string) => {
    const nextQuantity = Number.parseInt(value, 10);
    if (!Number.isFinite(nextQuantity)) {
      return;
    }

    if (nextQuantity <= 0) {
      removeItem(id);
      return;
    }

    const cappedQuantity = Math.min(nextQuantity, CART_MAX_ITEM_QTY);
    setItemQuantity(id, cappedQuantity);
  };

  const handleCheckout = () => {
    if (!isAuthenticated || items.length === 0) {
      return;
    }

    router.push("/checkout");
  };

  const canCheckout = isAuthenticated && items.length > 0;
  const isSessionLoading = status === "loading";

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-8 text-center text-white/70">
        <p className="text-lg font-medium text-white">Votre panier est vide.</p>
        <p className="mt-2 text-sm">
          Configurez votre premier katana dans{" "}
          <Link href="/atelier/demo" className="text-emberGold underline">
            l&apos;atelier interactif
          </Link>{" "}
          pour le retrouver ici.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,1fr),340px]">
      <section className="space-y-4 rounded-xl border border-white/10 bg-black/50 p-6 text-white/80">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Articles</h2>
          <button
            type="button"
            onClick={clear}
            className="text-xs uppercase tracking-[0.3em] text-white/50 transition hover:text-emberGold"
          >
            Vider
          </button>
        </header>

        <ul className="space-y-4">
          {summary.lines.map(({ item, totals }) => (
            <li
              key={item.id}
              className="rounded-lg border border-white/10 bg-black/40 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-white/50">SKU : {item.sku}</p>
                  <p className="text-xs text-white/50">
                    Prix unitaire : {toEuroString(item.unitCents)} TTC
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/50">
                    Quantite
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={CART_MAX_ITEM_QTY}
                    value={item.qty}
                    onChange={(event) => handleQuantityChange(item.id, event.target.value)}
                    className="w-20 rounded-md border border-white/20 bg-black/60 px-2 py-1 text-sm text-white focus:border-emberGold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs uppercase tracking-[0.3em] text-katanaRed transition hover:text-red-400"
                  >
                    Retirer
                  </button>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-white/60">
                  TVA {item.vatRatePct}% : {toEuroString(totals.taxCents)}
                </span>
                <span className="text-base font-semibold text-white">
                  {toEuroString(totals.grossCents)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className="space-y-4 rounded-xl border border-white/10 bg-black/60 p-6 text-white/80">
        <header>
          <h2 className="text-lg font-semibold text-white">Recapitulatif</h2>
          <p className="text-xs text-white/50">
            Les montants seront recalcules cote serveur avant la validation finale.
          </p>
        </header>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total HT</dt>
            <dd>{toEuroString(summary.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>TVA</dt>
            <dd>{toEuroString(summary.vat)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Livraison estimee</dt>
            <dd>{toEuroString(shippingCents)}</dd>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-3 text-base font-semibold text-white">
            <dt>Total TTC</dt>
            <dd>{toEuroString(summary.total)}</dd>
          </div>
        </dl>

        {!isAuthenticated ? (
          <div className="rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-xs text-white/60">
            <p>
              Vous devez{" "}
              <Link href="/connexion" className="text-emberGold underline">
                vous connecter
              </Link>{" "}
              pour continuer vers le paiement.
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={!canCheckout || isSessionLoading}
          className="w-full rounded-full bg-emberGold px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-black transition hover:bg-katanaRed hover:text-white disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {isSessionLoading ? "Chargement..." : "Continuer vers le checkout"}
        </button>

        <Link
          href="/atelier/demo"
          className="block text-center text-xs uppercase tracking-[0.3em] text-white/60 underline decoration-dotted underline-offset-4 transition hover:text-emberGold"
        >
          Continuer mes configurations
        </Link>
      </aside>
    </div>
  );
};

export default CartClient;
