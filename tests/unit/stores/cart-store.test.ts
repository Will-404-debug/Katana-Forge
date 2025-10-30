import { afterEach, describe, expect, it } from "vitest";

import { CART_MAX_ITEM_QTY, useCartStore } from "@/lib/stores/cart-store";

const resetStore = () => {
  useCartStore.setState({
    items: [],
    shippingCents: 2500,
    totalQuantity: 0,
  });
  const persist = useCartStore.persist;
  if (persist?.clearStorage) {
    void persist.clearStorage();
  }
};

type ItemShape = {
  id: string;
  sku: string;
  name: string;
  qty: number;
  unitCents: number;
  vatRatePct: number;
};

const baseItem: ItemShape = {
  id: "kat_aiko_alpha",
  sku: "KAT-AIKO",
  name: "Katana Aiko Alpha",
  qty: 1,
  unitCents: 42000,
  vatRatePct: 20,
};

const buildItem = (overrides?: Partial<ItemShape>): ItemShape => ({
  ...baseItem,
  ...overrides,
});

describe("useCartStore", () => {
  afterEach(() => {
    resetStore();
  });

  it("adds multiple items and tracks total quantity", () => {
    const store = useCartStore.getState();
    store.addItem(buildItem({ qty: 2 }));
    store.addItem(
      buildItem({
        id: "kat_kenji_master",
        sku: "KAT-KENJI",
        name: "Katana Kenji Master",
        qty: 1,
      }),
    );

    const { items, totalQuantity } = useCartStore.getState();
    expect(items).toHaveLength(2);
    expect(totalQuantity).toBe(3);
  });

  it("removes item when quantity set to zero or negative", () => {
    const store = useCartStore.getState();
    const sampleItem = buildItem();
    store.addItem(sampleItem);
    store.setItemQuantity(sampleItem.id, 0);

    const { items, totalQuantity } = useCartStore.getState();
    expect(items).toHaveLength(0);
    expect(totalQuantity).toBe(0);
  });

  it("caps item quantity at the maximum limit when adding repeatedly", () => {
    const store = useCartStore.getState();
    store.addItem(buildItem({ qty: CART_MAX_ITEM_QTY - 10 }));
    store.addItem(buildItem({ qty: 20 }));

    const { items, totalQuantity } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]?.qty).toBe(CART_MAX_ITEM_QTY);
    expect(totalQuantity).toBe(CART_MAX_ITEM_QTY);
  });

  it("caps manual quantity updates at the maximum limit", () => {
    const store = useCartStore.getState();
    const sampleItem = buildItem();
    store.addItem(sampleItem);
    store.setItemQuantity(sampleItem.id, CART_MAX_ITEM_QTY + 25);

    const { items } = useCartStore.getState();
    expect(items[0]?.qty).toBe(CART_MAX_ITEM_QTY);
  });

  it("clears cart state and resets shipping", () => {
    const store = useCartStore.getState();
    store.addItem(buildItem());
    store.clear();

    const { items, totalQuantity, shippingCents } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(totalQuantity).toBe(0);
    expect(shippingCents).toBe(2500);
  });

  it("normalises invalid persisted shipping cents during hydration", () => {
    const options = useCartStore.persist?.getOptions();
    const postHydrate = options?.onRehydrateStorage?.(useCartStore.getState());
    const hydratedState = {
      ...useCartStore.getState(),
      items: [
        buildItem({ qty: CART_MAX_ITEM_QTY + 30 }),
        buildItem({ id: "to_drop", qty: 0 }),
      ],
      shippingCents: Number.NaN,
    };

    postHydrate?.(hydratedState);

    expect(hydratedState.items).toHaveLength(1);
    expect(hydratedState.items[0]?.qty).toBe(CART_MAX_ITEM_QTY);
    expect(hydratedState.shippingCents).toBe(2500);
  });
});
