import { z } from "zod";

const phoneRegex = /^[0-9+().\-\s]{6,32}$/;

export const AddressSchema = z
  .object({
    company: z
      .string()
      .trim()
      .max(120)
      .optional()
      .transform((value) => (value && value.length === 0 ? undefined : value)),
    vatNumber: z
      .string()
      .trim()
      .max(32)
      .optional()
      .transform((value) => (value && value.length === 0 ? undefined : value)),
    line1: z.string().trim().min(1).max(200),
    line2: z
      .string()
      .trim()
      .max(200)
      .optional()
      .transform((value) => (value && value.length === 0 ? undefined : value)),
    city: z.string().trim().min(1).max(120),
    postalCode: z.string().trim().min(2).max(16),
    country: z.string().trim().toUpperCase().length(2),
  })
  .strict();

const CheckoutItemSchema = z
  .object({
    sku: z.string().trim().min(1).max(64),
    name: z.string().trim().min(1).max(160),
    qty: z.number().int().positive(),
    unitCents: z.number().int().nonnegative(),
    vatRatePct: z.number().int().min(0).max(25),
  })
  .strict();

export const CheckoutPayloadSchema = z
  .object({
    email: z.string().trim().email(),
    firstName: z.string().trim().min(1).max(120),
    lastName: z.string().trim().min(1).max(120),
    phone: z
      .string()
      .trim()
      .regex(phoneRegex, "Numéro de téléphone invalide")
      .optional(),
    ship: AddressSchema,
    billSame: z.boolean(),
    bill: AddressSchema.optional(),
    items: z.array(CheckoutItemSchema).min(1, "Au moins un article requis"),
    shippingCents: z.number().int().nonnegative(),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Le consentement RGPD est obligatoire" }),
    }),
    consentAt: z
      .string()
      .datetime()
      .optional(),
    policyVersion: z
      .string()
      .trim()
      .max(32)
      .optional()
      .transform((value) => (value && value.length === 0 ? undefined : value)),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (!data.billSame && !data.bill) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bill"],
        message: "Adresse de facturation requise",
      });
    }
  });

export const PayNowPayloadSchema = z
  .object({
    email: z.string().trim().email(),
    items: z.array(CheckoutItemSchema).min(1),
    shippingCents: z.number().int().nonnegative().default(0),
  })
  .strict();

export type AddressInput = z.infer<typeof AddressSchema>;
export type CheckoutItemInput = z.infer<typeof CheckoutItemSchema>;
export type CheckoutPayload = z.infer<typeof CheckoutPayloadSchema>;
export type PayNowPayload = z.infer<typeof PayNowPayloadSchema>;
