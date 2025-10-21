import { create } from "zustand";

type CartItem = {
  id: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  totalQuantity: number;
  addItem: (item: CartItem) => void;
  setItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

function computeTotal(items: CartItem[]) {
  return items.reduce((total, item) => total + Math.max(item.quantity, 0), 0);
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalQuantity: 0,
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((existingItem) => existingItem.id === item.id);

      const nextItems = existing
        ? state.items.map((existingItem) =>
            existingItem.id === item.id
              ? { ...existingItem, quantity: existingItem.quantity + item.quantity }
              : existingItem,
          )
        : [...state.items, item];

      return {
        items: nextItems,
        totalQuantity: computeTotal(nextItems),
      };
    }),
  setItemQuantity: (id, quantity) =>
    set((state) => {
      const sanitisedQuantity = Math.max(quantity, 0);

      const nextItems = sanitisedQuantity === 0
        ? state.items.filter((item) => item.id !== id)
        : state.items.map((item) => (item.id === id ? { ...item, quantity: sanitisedQuantity } : item));

      return {
        items: nextItems,
        totalQuantity: computeTotal(nextItems),
      };
    }),
  removeItem: (id) =>
    set((state) => {
      const nextItems = state.items.filter((item) => item.id !== id);
      return {
        items: nextItems,
        totalQuantity: computeTotal(nextItems),
      };
    }),
  clear: () => ({
    items: [],
    totalQuantity: 0,
  }),
}));
