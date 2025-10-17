import { redirect } from "next/navigation";

import { getAuthenticatedUser } from "@/lib/auth-helpers";

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/connexion");
  }

  const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <div className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8 text-white/80 backdrop-blur">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-emberGold">Profil securisé</p>
          <h1 className="text-3xl font-heading uppercase tracking-[0.3em] text-white">Votre profil</h1>
          <p className="text-sm text-white/60">
            Cette page est protegée par une session serveur. Seuls les forgerons authentifiés peuvent la consulter.
          </p>
        </header>

        <dl className="grid gap-4 text-sm text-white/70">
          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-white/50">Nom</dt>
            <dd className="mt-1 text-lg text-white">{user.name}</dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-white/50">Email</dt>
            <dd className="mt-1 text-lg text-white">{user.email}</dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-[0.3em] text-white/50">Compte Google</dt>
            <dd className="mt-1 text-lg text-white">
              {user.googleId ? "Connecte" : "Non connecte"}
            </dd>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-white/50">Création</dt>
              <dd className="mt-1 text-white">
                {dateFormatter.format(user.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.3em] text-white/50">Dernière mise à jour</dt>
              <dd className="mt-1 text-white">
                {dateFormatter.format(user.updatedAt)}
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </section>
  );
}
