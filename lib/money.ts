const CENT_FACTOR = 100;

export const toEuroString = (cents: number, locale = "fr-FR", currency = "EUR") =>
  (cents / CENT_FACTOR).toLocaleString(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const eurosFromCents = (cents: number): number => cents / CENT_FACTOR;

export const centsFromEuros = (amount: number): number => {
  const cents = Math.round(amount * CENT_FACTOR);
  assertSafeCents(cents);
  return cents;
};

export const sumCents = (...values: number[]): number => {
  let total = 0;
  for (const value of values) {
    assertSafeCents(value);
    total += value;
    assertSafeCents(total);
  }
  return total;
};

export const computeLineTotals = (params: {
  unitCents: number;
  qty: number;
  vatRatePct: number;
}) => {
  const { unitCents, qty, vatRatePct } = params;
  assertSafeCents(unitCents);
  if (!Number.isSafeInteger(qty) || qty <= 0) {
    throw new RangeError("Invalid quantity value");
  }
  if (!Number.isFinite(vatRatePct) || vatRatePct < 0) {
    throw new RangeError("Invalid VAT rate");
  }

  const lineNet = unitCents * qty;
  assertSafeCents(lineNet);

  const tax = Math.round(lineNet * (vatRatePct / 100));
  assertSafeCents(tax);

  const gross = sumCents(lineNet, tax);

  return {
    netCents: lineNet,
    taxCents: tax,
    grossCents: gross,
  };
};

const assertSafeCents = (value: number) => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("Cents value must be a non-negative safe integer");
  }
};
