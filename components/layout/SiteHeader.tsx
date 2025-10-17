
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SiteHeader() {
  const router = useRouter();
  const { user, initializing, logout } = useAuth();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    setPending(true);
    await logout();
    setPending(false);
    router.push("/");
  };

  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Katana Forge"
            width={56}
            height={56}
            className="h-10 w-auto object-contain md:h-12"
            priority
          />
          <span className="text-sm uppercase tracking-[0.6em] text-emberGold">Katana Forge</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-white/80">
          <Link className="transition hover:text-emberGold" href="/">
            Accueil
          </Link>
          <Link className="transition hover:text-emberGold" href="/atelier/demo">
            Atelier
          </Link>

          {initializing ? (
            <span className="text-white/50">Chargement...</span>
          ) : user ? (
            <>
              <Link className="transition hover:text-emberGold" href="/profile">
                Profil
              </Link>
              <Link className="transition hover:text-emberGold" href="/compte">
                Mon espace
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-white/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 transition hover:border-emberGold hover:text-emberGold"
                disabled={pending}
              >
                {pending ? "Sortie..." : "Deconnexion"}
              </button>
            </>
          ) : (
            <>
              <Link className="transition hover:text-emberGold" href="/connexion">
                Connexion
              </Link>
              <Link className="transition hover:text-emberGold" href="/inscription">
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
