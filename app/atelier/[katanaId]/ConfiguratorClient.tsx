"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import UIControls from "@/components/configurator/UIControls";
import { useAuth } from "@/components/auth/AuthProvider";
import type { KatanaConfiguration } from "@/lib/validation";
import { defaultKatanaConfig, katanaConfigSchema } from "@/lib/validation";

const KatanaCanvas = dynamic(() => import("@/components/configurator/KatanaCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-white/50">
      Chargement de l'atelier 3D...
    </div>
  ),
});

type ConfiguratorClientProps = {
  katanaId: string;
  basePrice: number;
};

type QuoteResponse = {
  price: number;
  currency: string;
  estimatedDeliveryWeeks: number;
};

export default function ConfiguratorClient({ katanaId, basePrice }: ConfiguratorClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const isDemo = katanaId === "demo";

  const [config, setConfig] = useState<KatanaConfiguration>(defaultKatanaConfig);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [katanaName, setKatanaName] = useState<string>("Katana demo");
  const [initialLoading, setInitialLoading] = useState<boolean>(!isDemo);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const previewPrice = useMemo(
    () => Math.round(basePrice + config.metalness * 50 + config.roughness * 35),
    [basePrice, config.metalness, config.roughness],
  );

  const updateConfig = (partial: Partial<KatanaConfiguration>) => {
    setConfig((previous) => {
      const next = { ...previous, ...partial };
      const validation = katanaConfigSchema.safeParse(next);
      if (!validation.success) {
        setErrorMessage("Configuration invalide");
        return previous;
      }
      setErrorMessage(null);
      return validation.data;
    });
  };

  const requestQuote = async () => {
    setStatus("loading");
    setErrorMessage(null);
    setQuote(null);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur serveur");
      }

      const data = (await response.json()) as QuoteResponse;
      setQuote(data);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Impossible de calculer le devis");
    }
  };

  useEffect(() => {
    if (isDemo) {
      setInitialLoading(false);
      setInitialError(null);
      setKatanaName("Katana demo");
      return;
    }

    let cancelled = false;

    const loadKatana = async () => {
      setInitialLoading(true);
      setInitialError(null);

      try {
        const response = await fetch(`/api/katanas/${katanaId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Connectez-vous pour charger cette configuration.");
          }

          if (response.status === 404) {
            throw new Error("Katana introuvable ou non disponible.");
          }

          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Impossible de charger ce katana");
        }

        const data = (await response.json()) as {
          katana: KatanaConfiguration & { id: string; name: string };
        };

        if (cancelled) {
          return;
        }

        setConfig({
          handleColor: data.katana.handleColor,
          bladeTint: data.katana.bladeTint,
          metalness: data.katana.metalness,
          roughness: data.katana.roughness,
        });
        setKatanaName(data.katana.name);
        setInitialError(null);
      } catch (loadError) {
        if (!cancelled) {
          setInitialError(
            loadError instanceof Error ? loadError.message : "Impossible de charger cette configuration",
          );
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    };

    void loadKatana();

    return () => {
      cancelled = true;
    };
  }, [katanaId, isDemo, user]);

  const handleSaveKatana = async () => {
    if (!user) {
      setSaveError("Connectez-vous pour enregistrer vos katanas.");
      return;
    }

    if (!katanaName.trim()) {
      setSaveError("Donnez un nom a votre katana avant d'enregistrer.");
      return;
    }

    setSaveStatus("saving");
    setSaveError(null);
    setSaveMessage(null);

    const payload = {
      name: katanaName.trim(),
      handleColor: config.handleColor,
      bladeTint: config.bladeTint,
      metalness: config.metalness,
      roughness: config.roughness,
    };

    try {
      const url = isDemo ? "/api/katanas" : `/api/katanas/${katanaId}`;
      const method = isDemo ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Impossible d'enregistrer ce katana");
      }

      const data = (await response.json()) as { katana: { id: string; name: string } };

      if (isDemo) {
        setSaveMessage("Katana enregistré ! Redirection vers votre sauvegarde...");
        router.push(`/atelier/${data.katana.id}`);
        return;
      }

      setKatanaName(data.katana.name);
      setSaveMessage("Katana sauvegardé avec succès.");
    } catch (saveException) {
      setSaveError(saveException instanceof Error ? saveException.message : "Sauvegarde impossible");
    } finally {
      setSaveStatus("idle");
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-white/80">
        <p className="text-xs uppercase tracking-[0.4em] text-emberGold">Atelier interactif</p>
        <h2 className="text-2xl font-heading uppercase tracking-[0.3em] text-emberGold">
          Configuration #{katanaId}
        </h2>
        <p className="text-sm text-white/60">
          Ajustez les parametres visuels du katana, puis calculez un devis instantané.
        </p>
        {initialError ? <p className="text-xs text-katanaRed">{initialError}</p> : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black/40">
          <KatanaCanvas config={config} />
        </div>
        <div className="space-y-6">
          <UIControls config={config} onUpdate={updateConfig} />

          {initialLoading ? (
            <section className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/70 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Chargement de la configuration...</p>
            </section>
          ) : null}

          <section className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/80 backdrop-blur">
            <h3 className="text-xs uppercase tracking-[0.4em] text-emberGold">Devis estimé</h3>
            <p className="mt-2 text-3xl font-heading text-emberGold">{previewPrice} EUR</p>
            <p className="mt-2 text-xs text-white/60">
              Base price {basePrice} EUR. Ajustez les curseurs pour visualiser l'impact sur le devis.
            </p>
            <button
              type="button"
              onClick={requestQuote}
              className="btn-primary mt-4"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Calcul en cours..." : "Demander un devis"}
            </button>
            {errorMessage ? (
              <p className="mt-3 text-xs text-katanaRed">{errorMessage}</p>
            ) : null}
            {quote ? (
              <div className="mt-4 space-y-1 text-xs text-white/60">
                <p>
                  Devis confirmé: <span className="text-white/90">{quote.price} {quote.currency}</span>
                </p>
                <p>Délai estimé: {quote.estimatedDeliveryWeeks} semaines</p>
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/80 backdrop-blur">
            <h3 className="text-xs uppercase tracking-[0.4em] text-emberGold">Sauvegarde</h3>
            {user ? (
              <div className="mt-4 space-y-4">
                <label className="block text-xs uppercase tracking-[0.3em] text-white/60">
                  Nom du katana
                  <input
                    type="text"
                    value={katanaName}
                    onChange={(event) => setKatanaName(event.target.value)}
                    placeholder="Nom de votre katana"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emberGold focus:outline-none"
                  />
                </label>
                {saveError ? <p className="text-xs text-katanaRed">{saveError}</p> : null}
                {saveMessage ? <p className="text-xs text-emberGold">{saveMessage}</p> : null}
                <button
                  type="button"
                  onClick={handleSaveKatana}
                  className="btn-primary w-full"
                  disabled={saveStatus === "saving"}
                >
                  {saveStatus === "saving"
                    ? "Sauvegarde en cours..."
                    : isDemo
                      ? "Enregistrer dans mon compte"
                      : "Mettre à jour"}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-white/60">
                <Link href="/connexion" className="text-emberGold underline decoration-dotted underline-offset-2">
                  Connectez-vous
                </Link>{" "}
                ou{" "}
                <Link href="/inscription" className="text-emberGold underline decoration-dotted underline-offset-2">
                  créez un compte
                </Link>{" "}
                pour sauvegarder vos configurations dans votre espace personnel.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
