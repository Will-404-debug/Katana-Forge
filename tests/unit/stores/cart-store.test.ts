import { afterEach, describe, expect, it } from "vitest";

import { useCartStore } from "@/lib/stores/cart-store";
import fixtures from "@/docs/tests/fixtures.json";

const resetStore = () => {
  useCartStore.setState({ items: [], totalQuantity: 0 });
};

describe("useCartStore", () => {
  afterEach(() => {
    resetStore();
  });

  it("adds multiple items and tracks total quantity", () => {
    resetStore();

    const store = useCartStore.getState();
    for (const item of fixtures.cart_basic) {
      store.addItem({ ...item });
    }

    const { items, totalQuantity } = useCartStore.getState();
    expect(items).toHaveLength(2);
    expect(totalQuantity).toBe(3);
  });

  it("removes item when quantity set to zero or negative", () => {
    const store = useCartStore.getState();

    store.addItem({ id: "kat_temp", quantity: 2 });
    store.setItemQuantity("kat_temp", fixtures.cart_negative.quantity);

    const { items, totalQuantity } = useCartStore.getState();
    expect(items).toHaveLength(0);
    expect(totalQuantity).toBe(0);
  });

  it("clears cart state", () => {
    useCartStore.getState().addItem({ id: "kat_temp", quantity: 1 });
    useCartStore.getState().clear();

    const { items, totalQuantity } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(totalQuantity).toBe(0);
  });
});
