"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

type KatanaItem = {
  id: string;
  name: string;
  handleColor: string;
  bladeTint: string;
  metalness: number;
  roughness: number;
  createdAt: string;
  updatedAt: string;
};

export default function AccountClient() {
  const router = useRouter();
  const { user, initializing } = useAuth();
  const [katanas, setKatanas] = useState<KatanaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchKatanas = useCallback(async () => {
    if (!user) {
      setKatanas([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/katanas", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Impossible de charger vos katanas");
      }

      const data = (await response.json()) as { katanas: KatanaItem[] };
      setKatanas(data.katanas);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!initializing && !user) {
      router.replace("/connexion");
    }
  }, [initializing, user, router]);

  useEffect(() => {
    if (user) {
      void fetchKatanas();
    }
  }, [user, fetchKatanas]);

  const handleDelete = async (katanaId: string) => {
    if (!confirm("Supprimer ce katana ?")) {
      return;
    }

    setDeletingId(katanaId);
    setError(null);

    try {
      const response = await fetch(`/api/katanas/${katanaId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Impossible de supprimer ce katana");
      }

      setKatanas((previous) => previous.filter((katana) => katana.id !== katanaId));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Suppression impossible");
    } finally {
      setDeletingId(null);
    }
  };

  if (initializing) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/40 p-8 text-white/70">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">Chargement de votre espace...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const displayName = user.name?.split(" ")[0] ?? user.name ?? user.email ?? "Forgeron";

  return (
    <div className="space-y-8">
      <header className="space-y-2 text-white/80">
        <p className="text-xs uppercase tracking-[0.4em] text-emberGold">Espace forgeron</p>
        <h1 className="text-3xl font-heading uppercase tracking-[0.3em] text-white">
          Bienvenue {displayName}
        </h1>
        <p className="text-xs text-white/60">Retrouvez vos creations et reprenez leur forge quand vous le souhaitez.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/atelier/demo" className="btn-primary">
            Forger un nouveau katana
          </Link>
        </div>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 text-sm text-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.4em] text-emberGold">Vos katanas sauvegardes</h2>
          <button
            type="button"
            onClick={() => {
              void fetchKatanas();
            }}
            className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 transition hover:border-emberGold hover:text-emberGold"
            disabled={loading}
          >
            Rafraichir
          </button>
        </div>

        {error ? <p className="text-xs text-katanaRed">{error}</p> : null}

        {loading ? (
          <p className="text-xs text-white/60">Chargement de vos katanas...</p>
        ) : katanas.length === 0 ? (
          <p className="text-xs text-white/60">
            Vous n avez pas encore de katana sauvegarde. Rendez-vous dans l atelier pour enregistrer votre premiere
            creation.
          </p>
        ) : (
          <ul className="grid gap-4">
            {katanas.map((katana) => (
              <li
                key={katana.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs text-white/70 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold tracking-[0.2em] text-white/90">{katana.name}</p>
                  <p className="text-white/50">
                    Poignee <span style={{ color: katana.handleColor }}>{katana.handleColor}</span> / Lame{" "}
                    <span style={{ color: katana.bladeTint }}>{katana.bladeTint}</span>
                  </p>
                  <p className="text-white/50">
                    Metalness {(katana.metalness * 100).toFixed(0)}% - Roughness {(katana.roughness * 100).toFixed(0)}%
                  </p>
                  <p className="text-white/40">
                    Mis a jour le {new Date(katana.updatedAt).toLocaleDateString("fr-FR", { dateStyle: "medium" })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/atelier/${katana.id}`}
                    className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 transition hover:border-emberGold hover:text-emberGold"
                  >
                    Reprendre
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(katana.id)}
                    className="rounded-full border border-katanaRed/40 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-katanaRed transition hover:border-katanaRed hover:text-katanaRed"
                    disabled={deletingId === katana.id}
                  >
                    {deletingId === katana.id ? "Suppression..." : "Supprimer"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
