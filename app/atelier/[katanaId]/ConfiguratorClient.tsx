"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import UIControls from "@/components/configurator/UIControls";
import { useAuth } from "@/components/auth/AuthProvider";
import type { KatanaConfiguration } from "@/lib/validation";
import { defaultKatanaConfig, katanaConfigSchema } from "@/lib/validation";
import { DEFAULT_BACKGROUND_COLOR, backgroundColorSchema } from "@/lib/background";
import type { DraftSnapshot } from "@/lib/drafts";
import { parseDraftSnapshot } from "@/lib/drafts";

const KatanaCanvas = dynamic(() => import("@/components/configurator/KatanaCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.4em] text-white/50">
      Chargement de l&apos;atelier 3D...
    </div>
  ),
});

const BACKGROUND_STORAGE_KEY = "katana-background-color";
const DRAFT_STORAGE_KEY = "katana-draft";
const DRAFT_SYNC_DELAY = 600;

type ConfiguratorClientProps = {
  katanaId: string;
  basePrice: number;
};

type QuoteResponse = {
  price: number;
  currency: string;
  estimatedDeliveryWeeks: number;
};

type DraftState = DraftSnapshot & { updatedAt: string };

function computeDraftHash(draft: Pick<DraftState, "handleColor" | "bladeTint" | "metalness" | "roughness" | "quantity">) {
  return [
    draft.handleColor,
    draft.bladeTint,
    draft.metalness.toFixed(4),
    draft.roughness.toFixed(4),
    draft.quantity.toString(),
  ].join("|");
}

function ensureDraftState(data: unknown): DraftState | null {
  const parsed = parseDraftSnapshot(data);

  if (!parsed) {
    return null;
  }

  return {
    handleColor: parsed.handleColor,
    bladeTint: parsed.bladeTint,
    metalness: parsed.metalness,
    roughness: parsed.roughness,
    quantity: parsed.quantity,
    updatedAt: parsed.updatedAt ?? new Date().toISOString(),
  };
}

export default function ConfiguratorClient({ katanaId, basePrice }: ConfiguratorClientProps) {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const isDemo = katanaId === "demo";

  const [config, setConfig] = useState<KatanaConfiguration>(defaultKatanaConfig);
  const [quantity, setQuantity] = useState<number>(1);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [katanaName, setKatanaName] = useState<string>("Katana demo");
  const [initialLoading, setInitialLoading] = useState<boolean>(!isDemo);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<string>(DEFAULT_BACKGROUND_COLOR);
  const [backgroundError, setBackgroundError] = useState<string | null>(null);

  const backgroundSyncedRef = useRef<string>(DEFAULT_BACKGROUND_COLOR);
  const backgroundRequestRef = useRef<AbortController | null>(null);

  const draftHydratedRef = useRef(false);
  const draftPersistIgnoreRef = useRef(false);
  const draftSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDraftHashRef = useRef<string | null>(null);
  const lastServerDraftHashRef = useRef<string | null>(null);

  const saveDraftLocally = useCallback((draft: DraftState) => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore storage quota errors
    }
  }, []);

  const readLocalDraft = useCallback((): DraftState | null => {
    if (typeof window === "undefined") {
      return null;
    }

    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    try {
      const parsed = ensureDraftState(JSON.parse(raw));
      if (!parsed) {
        window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
      return parsed;
    } catch {
      window.localStorage.removeItem(DRAFT_STORAGE_KEY);
      return null;
    }
  }, []);

  const buildDraftState = useCallback(
    (overrides?: Partial<DraftState>): DraftState => ({
      handleColor: overrides?.handleColor ?? config.handleColor,
      bladeTint: overrides?.bladeTint ?? config.bladeTint,
      metalness: overrides?.metalness ?? config.metalness,
      roughness: overrides?.roughness ?? config.roughness,
      quantity: overrides?.quantity ?? quantity,
      updatedAt: overrides?.updatedAt ?? new Date().toISOString(),
    }),
    [config.bladeTint, config.handleColor, config.metalness, config.roughness, quantity],
  );

  const applyDraft = useCallback(
    (draft: DraftState, options?: { fromServer?: boolean }) => {
      draftPersistIgnoreRef.current = true;
      setConfig(() => ({
        handleColor: draft.handleColor,
        bladeTint: draft.bladeTint,
        metalness: draft.metalness,
        roughness: draft.roughness,
      }));
      setQuantity(draft.quantity);
      const hash = computeDraftHash(draft);
      lastDraftHashRef.current = hash;
      if (options?.fromServer) {
        lastServerDraftHashRef.current = hash;
      }
      saveDraftLocally(draft);
      setErrorMessage(null);
    },
    [saveDraftLocally],
  );

  const syncDraftToServer = useCallback(
    async (draft: DraftState) => {
      try {
        const response = await fetch("/api/drafts", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            handleColor: draft.handleColor,
            bladeTint: draft.bladeTint,
            metalness: draft.metalness,
            roughness: draft.roughness,
            quantity: draft.quantity,
          }),
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { draft?: DraftSnapshot | null };
        const nextDraft = ensureDraftState(data?.draft ?? null);

        if (nextDraft) {
          lastServerDraftHashRef.current = computeDraftHash(nextDraft);
          saveDraftLocally(nextDraft);
        }
      } catch {
        // swallow network errors
      }
    },
    [saveDraftLocally],
  );

  const unitPrice = useMemo(
    () => Math.round(basePrice + config.metalness * 50 + config.roughness * 35),
    [basePrice, config.metalness, config.roughness],
  );
  const previewPrice = useMemo(() => unitPrice * quantity, [quantity, unitPrice]);

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

  useEffect(() => {
    if (!isDemo) {
      draftHydratedRef.current = false;
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    draftHydratedRef.current = false;

    const localDraft = readLocalDraft();
    if (localDraft) {
      applyDraft(localDraft);
    }

    const hydrate = async () => {
      try {
        if (user) {
          const response = await fetch("/api/drafts/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(localDraft ?? {}),
            signal: controller.signal,
          });

          if (!response.ok || cancelled) {
            return;
          }

          const data = (await response.json()) as { draft: DraftSnapshot | null };
          const next = ensureDraftState(data?.draft ?? null);
          if (next) {
            applyDraft(next, { fromServer: true });
          }
        } else {
          const response = await fetch("/api/drafts", {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          });

          if (!response.ok || cancelled) {
            return;
          }

          const data = (await response.json()) as { draft: DraftSnapshot | null };
          const next = ensureDraftState(data?.draft ?? null);
          if (next) {
            applyDraft(next, { fromServer: true });
          }
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
      } finally {
        if (!cancelled) {
          draftHydratedRef.current = true;
        }
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [applyDraft, isDemo, readLocalDraft, user]);

  useEffect(() => {
    if (user) {
      const parsed = backgroundColorSchema.safeParse(user.backgroundColor);
      const nextColor = parsed.success ? parsed.data : DEFAULT_BACKGROUND_COLOR;
      backgroundSyncedRef.current = nextColor;
      setBackgroundColor(nextColor);
      setBackgroundError(null);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(BACKGROUND_STORAGE_KEY, nextColor);
      }
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(BACKGROUND_STORAGE_KEY);
    const parsed = stored ? backgroundColorSchema.safeParse(stored) : null;

    if (parsed?.success) {
      backgroundSyncedRef.current = parsed.data;
      setBackgroundColor(parsed.data);
    } else {
      if (stored) {
        window.localStorage.removeItem(BACKGROUND_STORAGE_KEY);
      }
      backgroundSyncedRef.current = DEFAULT_BACKGROUND_COLOR;
      setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
    }
    setBackgroundError(null);
  }, [user]);

  useEffect(() => {
    if (backgroundColor === backgroundSyncedRef.current) {
      return;
    }

    if (!user) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundColor);
      }
      backgroundSyncedRef.current = backgroundColor;
      setBackgroundError(null);
      return;
    }

    backgroundRequestRef.current?.abort();
    const controller = new AbortController();
    backgroundRequestRef.current = controller;
    setBackgroundError(null);

    const persist = async () => {
      try {
        const response = await fetch("/api/preferences/background", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backgroundColor }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Impossible d'enregistrer la couleur de fond");
        }

        backgroundSyncedRef.current = backgroundColor;
        if (typeof window !== "undefined") {
          window.localStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundColor);
        }
        await refreshUser();
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        setBackgroundError(error instanceof Error ? error.message : "Impossible d'enregistrer la couleur de fond");
        setBackgroundColor(backgroundSyncedRef.current);
      }
    };

    void persist();

    return () => {
      controller.abort();
    };
  }, [backgroundColor, refreshUser, user]);

  useEffect(() => {
    return () => {
      backgroundRequestRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isDemo) {
      return;
    }

    if (!draftHydratedRef.current) {
      return;
    }

    if (draftPersistIgnoreRef.current) {
      draftPersistIgnoreRef.current = false;
      return;
    }

    const nextDraft = buildDraftState({ updatedAt: new Date().toISOString() });
    const hash = computeDraftHash(nextDraft);

    if (lastDraftHashRef.current === hash && lastServerDraftHashRef.current === hash) {
      return;
    }

    lastDraftHashRef.current = hash;
    saveDraftLocally(nextDraft);

    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }

    draftSaveTimeoutRef.current = setTimeout(() => {
      void syncDraftToServer(nextDraft);
    }, DRAFT_SYNC_DELAY);
  }, [buildDraftState, isDemo, saveDraftLocally, syncDraftToServer]);

  const handleBackgroundChange = (color: string) => {
    setBackgroundError(null);
    setBackgroundColor(color);
  };

  const handleBackgroundReset = () => {
    setBackgroundError(null);
    setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
  };

  const handleQuantityChange = useCallback((nextQuantity: number) => {
    setQuantity(nextQuantity);
  }, []);

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
        setSaveMessage("Katana enregistre ! Redirection vers votre sauvegarde...");
        router.push(`/atelier/${data.katana.id}`);
        return;
      }

      setKatanaName(data.katana.name);
      setSaveMessage("Katana sauvegarde avec succes.");
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
          Ajustez les parametres visuels du katana, puis calculez un devis instantane.
        </p>
        {initialError ? <p className="text-xs text-katanaRed">{initialError}</p> : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div className="aspect-video overflow-hidden rounded-3xl border border-white/10 bg-black/40">
          <KatanaCanvas config={config} backgroundColor={backgroundColor} />
        </div>
        <div className="space-y-6">
          <UIControls
            config={config}
            onUpdate={updateConfig}
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            backgroundColor={backgroundColor}
            onBackgroundChange={handleBackgroundChange}
            onBackgroundReset={handleBackgroundReset}
            backgroundError={backgroundError}
          />

          {initialLoading ? (
            <section className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/70 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">Chargement de la configuration...</p>
            </section>
          ) : null}

          <section className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-white/80 backdrop-blur">
            <h3 className="text-xs uppercase tracking-[0.4em] text-emberGold">Devis estime</h3>
            <p className="mt-2 text-3xl font-heading text-emberGold">{previewPrice} EUR</p>
            <p className="mt-1 text-xs text-white/60">
              {quantity > 1 ? `${unitPrice} EUR par unite x ${quantity}` : `${unitPrice} EUR pour une piece`}
            </p>
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
                  Devis confirme: <span className="text-white/90">{quote.price} {quote.currency}</span>
                </p>
                <p>Delai estime: {quote.estimatedDeliveryWeeks} semaines</p>
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
                      : "Mettre a jour"}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-white/60">
                <Link href="/connexion" className="text-emberGold underline decoration-dotted underline-offset-2">
                  Connectez-vous
                </Link>{" "}
                ou{" "}
                <Link href="/inscription" className="text-emberGold underline decoration-dotted underline-offset-2">
                  creez un compte
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
