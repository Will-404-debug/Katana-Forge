import { computeLineTotals, sumCents } from "../money";
import type { CheckoutItemInput } from "../validation/checkout";

export type CalculatedLine = CheckoutItemInput & {
  netCents: number;
  taxCents: number;
  grossCents: number;
};

export type QuoteTotals = {
  subtotalCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
};

export const recalculateTotals = (params: {
  items: CheckoutItemInput[];
  shippingCents: number;
}): { lines: CalculatedLine[]; totals: QuoteTotals } => {
  const { items, shippingCents } = params;

  if (!Number.isSafeInteger(shippingCents) || shippingCents < 0) {
    throw new RangeError("Invalid shipping amount");
  }

  const lines = items.map<CalculatedLine>((item) => {
    const totals = computeLineTotals({
      unitCents: item.unitCents,
      qty: item.qty,
      vatRatePct: item.vatRatePct,
    });

    return {
      ...item,
      netCents: totals.netCents,
      taxCents: totals.taxCents,
      grossCents: totals.grossCents,
    };
  });

  const subtotalCents = lines.reduce((acc, line) => acc + line.netCents, 0);
  const taxCents = lines.reduce((acc, line) => acc + line.taxCents, 0);
  const totalCents = sumCents(subtotalCents, taxCents, shippingCents);

  return {
    lines,
    totals: {
      subtotalCents,
      taxCents,
      shippingCents,
      totalCents,
    },
  };
};
