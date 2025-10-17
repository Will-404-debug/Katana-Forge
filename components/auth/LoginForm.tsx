
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginForm() {
  const router = useRouter();
  const { login, user, initializing } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!initializing && user) {
      router.replace("/compte");
    }
  }, [initializing, user, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPending(true);
    setError(null);

    const result = await login({ email, password });

    if (result.success) {
      router.replace("/compte");
    } else {
      setError(result.error ?? "Identifiants invalides");
    }

    setPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8 text-white/80">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-emberGold">Connexion</p>
        <h1 className="text-2xl font-heading uppercase tracking-[0.3em] text-white">Retrouvez la forge</h1>
        <p className="text-xs text-white/60">Connectez-vous pour retrouver vos configurations sauvegardées.</p>
      </header>

      <div className="grid gap-4">
        <label className="text-xs uppercase tracking-[0.3em] text-white/60">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emberGold focus:outline-none"
          />
        </label>

        <label className="text-xs uppercase tracking-[0.3em] text-white/60">
          Mot de passe
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            className="mt-2 w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2 text-sm text-white focus:border-emberGold focus:outline-none"
          />
        </label>
      </div>

      {error ? <p className="text-xs text-katanaRed">{error}</p> : null}

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </button>

      <div className="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-white/40">
        <span className="h-px flex-1 bg-white/10" aria-hidden />
        <span>ou</span>
        <span className="h-px flex-1 bg-white/10" aria-hidden />
      </div>

      <GoogleSignInButton />

      <p className="text-center text-xs text-white/50">
        Pas de compte ?{" "}
        <Link href="/inscription" className="text-emberGold underline decoration-dotted underline-offset-4">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
