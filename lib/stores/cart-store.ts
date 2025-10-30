import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CheckoutItemInput } from "@/lib/validation/checkout";

export const CART_MAX_ITEM_QTY = 100;
const DEFAULT_SHIPPING_CENTS = 2500;

const clampQuantity = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const rounded = Math.floor(value);
  if (rounded <= 0) {
    return 0;
  }
  return Math.min(rounded, CART_MAX_ITEM_QTY);
};

const normaliseShippingCents = (value: number | undefined | null) => {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    return DEFAULT_SHIPPING_CENTS;
  }
  return value;
};

export type CartItem = CheckoutItemInput & {
  id: string;
};

type CartState = {
  items: CartItem[];
  shippingCents: number;
  totalQuantity: number;
  addItem: (item: CartItem) => void;
  setItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

type StorageShape = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
};

const computeTotalQuantity = (items: CartItem[]) =>
  items.reduce((total, item) => total + clampQuantity(item.qty), 0);

const memoryStorage = (): StorageShape => {
  const storage = new Map<string, string>();
  return {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: (key) => {
      storage.delete(key);
    },
  };
};

const resolveStorage = () =>
  typeof window === "undefined" ? memoryStorage() : window.localStorage;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingCents: DEFAULT_SHIPPING_CENTS,
      totalQuantity: 0,
      addItem: (item) =>
        set((state) => {
          const sanitisedQty = clampQuantity(item.qty);
          if (sanitisedQty === 0) {
            return state;
          }

          const existing = state.items.find((candidate) => candidate.id === item.id);
          const nextItems = existing
            ? state.items.map((candidate) =>
                candidate.id === item.id
                  ? { ...candidate, qty: clampQuantity(candidate.qty + sanitisedQty) }
                  : candidate,
              )
            : [...state.items, { ...item, qty: sanitisedQty }];

          return {
            items: nextItems,
            shippingCents: normaliseShippingCents(state.shippingCents),
            totalQuantity: computeTotalQuantity(nextItems),
          };
        }),
      setItemQuantity: (id, quantity) =>
        set((state) => {
          const sanitisedQuantity = clampQuantity(quantity);

          const nextItems =
            sanitisedQuantity === 0
              ? state.items.filter((item) => item.id !== id)
              : state.items.map((item) =>
                  item.id === id ? { ...item, qty: sanitisedQuantity } : item,
                );

          return {
            items: nextItems,
            shippingCents: normaliseShippingCents(state.shippingCents),
            totalQuantity: computeTotalQuantity(nextItems),
          };
        }),
      removeItem: (id) =>
        set((state) => {
          const nextItems = state.items.filter((item) => item.id !== id);
          return {
            items: nextItems,
            shippingCents: normaliseShippingCents(state.shippingCents),
            totalQuantity: computeTotalQuantity(nextItems),
          };
        }),
      clear: () =>
        set(() => ({
          items: [],
          shippingCents: DEFAULT_SHIPPING_CENTS,
          totalQuantity: 0,
        })),
    }),
    {
      name: "katana-cart",
      storage: createJSONStorage(resolveStorage),
      partialize: (state) => ({
        items: state.items,
        shippingCents: state.shippingCents,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = state.items
            .map((item) => ({ ...item, qty: clampQuantity(item.qty) }))
            .filter((item) => item.qty > 0);
          state.totalQuantity = computeTotalQuantity(state.items);
          state.shippingCents = normaliseShippingCents(state.shippingCents);
        }
      },
    },
  ),
);
