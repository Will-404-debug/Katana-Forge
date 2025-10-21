"use client";

import { useEffect, useMemo, useState } from "react";

import { backgroundColorSchema, DEFAULT_BACKGROUND_COLOR } from "@/lib/background";

type BackgroundColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
  onReset: () => void;
  error?: string | null;
};

const SWATCH_COLORS = ["#040405", "#101828", "#1f2937", "#2f2342", "#3b5d5f", "#d9d2c5", "#f4f1eb"] as const;

export default function BackgroundColorPicker({ value, onChange, onReset, error }: BackgroundColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const normalizedValue = useMemo(() => value.toLowerCase(), [value]);

  const handleTextChange = (raw: string) => {
    setInputValue(raw);
    const parsed = backgroundColorSchema.safeParse(raw);
    if (parsed.success) {
      onChange(parsed.data);
    }
  };

  const handleColorInputChange = (raw: string) => {
    const parsed = backgroundColorSchema.safeParse(raw);
    if (parsed.success) {
      onChange(parsed.data);
    }
  };

  const handleSwatchClick = (color: string) => {
    onChange(color);
  };

  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Arriere-plan</p>
          <p className="text-[0.7rem] text-white/50">Choisissez la couleur du studio 3D.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 transition hover:border-emberGold hover:text-emberGold"
          disabled={normalizedValue === DEFAULT_BACKGROUND_COLOR}
        >
          Defaut
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="list">
        {SWATCH_COLORS.map((color) => {
          const isActive = normalizedValue === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              role="listitem"
              aria-label={`Arriere-plan ${color}`}
              onClick={() => handleSwatchClick(color)}
              className={`h-9 w-9 rounded-full border transition ${
                isActive ? "border-emberGold ring-2 ring-emberGold/60 ring-offset-2 ring-offset-black/70" : "border-white/20"
              }`}
              style={{ backgroundColor: color }}
              data-testid={`background-swatch-${color.replace("#", "")}`}
            />
          );
        })}
      </div>

      <div className="flex gap-3">
        <label className="flex w-24 flex-col text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
          Hex
          <input
            type="text"
            inputMode="text"
            value={inputValue}
            onChange={(event) => handleTextChange(event.target.value)}
            placeholder="#040405"
            maxLength={7}
            className="mt-1 rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white focus:border-emberGold focus:outline-none"
            data-testid="background-hex-input"
          />
        </label>
        <label className="flex flex-1 flex-col text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
          Couleur
          <input
            type="color"
            value={normalizedValue}
            onChange={(event) => handleColorInputChange(event.target.value)}
            className="mt-1 h-[42px] w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
            data-testid="background-color-input"
          />
        </label>
      </div>

      {error ? <p className="text-xs text-katanaRed">{error}</p> : null}
    </div>
  );
}
