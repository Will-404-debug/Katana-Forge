"use client";

import type { ChangeEvent } from "react";
import type { KatanaConfiguration } from "@/lib/validation";

type UIControlsProps = {
  config: KatanaConfiguration;
  onUpdate: (partial: Partial<KatanaConfiguration>) => void;
};

export default function UIControls({ config, onUpdate }: UIControlsProps) {
  const handleRangeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onUpdate({ [name]: parseFloat(value) } as Partial<KatanaConfiguration>);
  };

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onUpdate({ [name]: value } as Partial<KatanaConfiguration>);
  };

  return (
    <section className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-6 text-white/80 shadow-xl backdrop-blur">
      <header>
        <h3 className="text-sm uppercase tracking-[0.4em] text-emberGold">Parametres</h3>
        <p className="mt-2 text-xs text-white/60">
          Ajustez la couleur du tsuka, l eclat de la lame et la finition metallique.
        </p>
      </header>

      <div className="grid gap-5 text-sm">
        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between uppercase tracking-[0.3em] text-xs text-white/60">
            Tsuka
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/50">{config.handleColor}</span>
          </span>
          <input
            type="color"
            name="handleColor"
            value={config.handleColor}
            onChange={handleColorChange}
            className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between uppercase tracking-[0.3em] text-xs text-white/60">
            Lame
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/50">{config.bladeTint}</span>
          </span>
          <input
            type="color"
            name="bladeTint"
            value={config.bladeTint}
            onChange={handleColorChange}
            className="h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between uppercase tracking-[0.3em] text-xs text-white/60">
            Metalness
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/50">
              {(config.metalness * 100).toFixed(0)}%
            </span>
          </span>
          <input
            type="range"
            name="metalness"
            min={0}
            max={1}
            step={0.01}
            value={config.metalness}
            onChange={handleRangeChange}
            className="h-2 w-full cursor-ew-resize appearance-none rounded-full bg-white/10"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="flex items-center justify-between uppercase tracking-[0.3em] text-xs text-white/60">
            Roughness
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/50">
              {(config.roughness * 100).toFixed(0)}%
            </span>
          </span>
          <input
            type="range"
            name="roughness"
            min={0}
            max={1}
            step={0.01}
            value={config.roughness}
            onChange={handleRangeChange}
            className="h-2 w-full cursor-ew-resize appearance-none rounded-full bg-white/10"
          />
        </label>
      </div>
    </section>
  );
}
