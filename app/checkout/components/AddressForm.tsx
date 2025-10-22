"use client";

import { useFormContext } from "react-hook-form";

import type { CheckoutPayload } from "@/lib/validation/checkout";

const COUNTRIES = [
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "DE", label: "Allemagne" },
  { code: "ES", label: "Espagne" },
  { code: "IT", label: "Italie" },
] as const;

type Props = {
  prefix: "ship" | "bill";
};

type AddressField = keyof CheckoutPayload["ship"];

const AddressForm = ({ prefix }: Props) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<CheckoutPayload>();

  const scopedErrors = errors[prefix] as Partial<Record<AddressField, { message?: string }>> | undefined;
  const errorMessage = (field: AddressField) => scopedErrors?.[field]?.message;

  const field = (name: AddressField) => `${prefix}.${name}` as const;

  return (
    <div className="grid gap-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-neutral-700" htmlFor={`${prefix}-company`}>
          Société (optionnel)
        </label>
        <input
          id={`${prefix}-company`}
          type="text"
          {...register(field("company"))}
          className="mt-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-black focus:outline-none"
          autoComplete="organization"
        />
        {errorMessage("company") ? (
          <p className="mt-1 text-sm text-red-600">{errorMessage("company")}</p>
        ) : null}
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-neutral-700" htmlFor={`${prefix}-vatNumber`}>
          N° TVA (optionnel)
        </label>
        <input
          id={`${prefix}-vatNumber`}
          type="text"
          {...register(field("vatNumber"))}
          className="mt-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-black focus:outline-none"
          autoComplete="tax-number"
        />
        {errorMessage("vatNumber") ? (
          <p className="mt-1 text-sm text-red-600">{errorMessage("vatNumber")}</p>
        ) : null}
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-neutral-700" htmlFor={`${prefix}-line1`}>
          Adresse
        </label>
        <input
          id={`${prefix}-line1`}
          type="text"
          {...register(field("line1"))}
          className="mt-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-black focus:outline-none"
          autoComplete="address-line1"
        />
        {errorMessage("line1") ? (
          <p className="mt-1 text-sm text-red-600">{errorMessage("line1")}</p>
        ) : null}
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-neutral-700" htmlFor={`${prefix}-line2`}>
          Complément d’adresse (optionnel)
        </label>
        <input
          id={`${prefix}-line2`}
          type="text"
          {...register(field("line2"))}
          className="mt-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-black focus:outline-none"
          autoComplete="address-line2"
        />
        {errorMessage("line2") ? (
          <p className="mt-1 text-sm text-red-600">{errorMessage("line2")}</p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-neutral-700" htmlFor={`${prefix}-postalCode`}>
            Code postal
          </label>
          <input
            id={`${prefix}-postalCode`}
            type="text"
            {...register(field("postalCode"))}
            className="mt-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-black focus:outline-none"
            autoComplete="postal-code"
          />
          {errorMessage("postalCode") ? (
            <p className="mt-1 text-sm text-red-600">{errorMessage("postalCode")}</p>
          ) : null}
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-neutral-700" htmlFor={`${prefix}-city`}>
            Ville
          </label>
          <input
            id={`${prefix}-city`}
            type="text"
            {...register(field("city"))}
            className="mt-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-black focus:outline-none"
            autoComplete="address-level2"
          />
          {errorMessage("city") ? (
            <p className="mt-1 text-sm text-red-600">{errorMessage("city")}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col">
        <label className="text-sm font-medium text-neutral-700" htmlFor={`${prefix}-country`}>
          Pays
        </label>
        <select
          id={`${prefix}-country`}
          {...register(field("country"))}
          className="mt-1 rounded-md border border-neutral-300 px-3 py-2 focus:border-black focus:outline-none"
          autoComplete="country-name"
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </select>
        {errorMessage("country") ? (
          <p className="mt-1 text-sm text-red-600">{errorMessage("country")}</p>
        ) : null}
      </div>
    </div>
  );
};

export default AddressForm;
