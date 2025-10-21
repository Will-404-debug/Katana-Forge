"use client";

import { useState } from "react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useSession } from "@/lib/use-session";

export default function CartIcon() {
  const { status, isAuthenticated } = useSession();
  const totalQuantity = useCartStore((state) => state.totalQuantity);

  const displayCount = totalQuantity > 99 ? "99+" : totalQuantity.toString();

  if (!isAuthenticated) {
    return <GuestCartIcon isLoading={status === "loading"} />;
  }

  return (
    <button
      type="button"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/80 transition hover:border-emberGold hover:text-emberGold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emberGold/60"
      aria-label={`Panier (${displayCount} article${totalQuantity > 1 ? "s" : ""})`}
      data-testid="cart-icon-authenticated"
    >
      <CartGlyph className="h-5 w-5" />
      <span
        className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emberGold px-1 text-[0.65rem] font-semibold text-black"
        data-testid="cart-item-count"
      >
        {displayCount}
      </span>
    </button>
  );
}

function GuestCartIcon({ isLoading = false }: { isLoading?: boolean }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div
      className="relative flex h-9 w-9 items-center justify-center overflow-visible"
      data-testid="cart-icon-guest"
      aria-busy={isLoading}
      onMouseEnter={() => setTooltipVisible(true)}
      onMouseLeave={() => setTooltipVisible(false)}
    >
      <button
        type="button"
        className={`flex h-full w-full items-center justify-center rounded-full border border-dashed border-white/10 text-white/40 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emberGold/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/70 ${
          isLoading ? "animate-pulse text-white/30" : "hover:border-emberGold/50 hover:text-white/60"
        }`}
        aria-describedby="cart-login-tooltip"
        aria-label="Connexion requise pour accéder au panier"
        disabled
        onFocus={() => setTooltipVisible(true)}
        onBlur={() => setTooltipVisible(false)}
      >
        <CartGlyph className="h-5 w-5" />
        <span className="sr-only">Connectez-vous pour accéder au panier</span>
      </button>

      <div
        id="cart-login-tooltip"
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-[0.7rem] text-white/80 shadow-lg transition-opacity duration-150 ${
          tooltipVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        Connectez-vous pour accéder au panier.
      </div>
    </div>
  );
}

function CartGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 6h15l-1.5 9h-12z" />
      <path d="M6 6 4 3H2" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="18" cy="19" r="1.5" />
    </svg>
  );
}
