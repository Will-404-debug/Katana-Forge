import type { Metadata } from "next";

const LAST_UPDATE_ISO = "2025-10-12";
const LAST_UPDATE_LABEL = "12 octobre 2025";

export const metadata: Metadata = {
  title: "Mentions legales | Katana Forge",
  description: "Informations legales et editeur du site Katana Forge.",
  alternates: {
    canonical: "/legal/mentions-legales",
  },
  openGraph: {
    title: "Mentions legales | Katana Forge",
    description: "Toutes les informations relatives a l editeur et a l hebergement de Katana Forge.",
    url: "https://katana-forge.example.com/legal/mentions-legales",
  },
};

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto grid max-w-4xl gap-10 px-6 py-16 text-white/70">
      <header className="space-y-3 text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-emberGold">Legal</p>
        <h1 className="text-3xl font-heading uppercase tracking-[0.35em] md:text-4xl">Mentions legales</h1>
        <p className="text-sm text-white/50">
          Derniere mise a jour : <time dateTime={LAST_UPDATE_ISO}>{LAST_UPDATE_LABEL}</time>
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Editeur du site</h2>
        <p>
          Katana Forge est edite par Forge Studio SAS, societe par actions simplifiee au capital de 75 000 euros,
          immatriculee au RCS de Lyon sous le numero 902 555 314. Siege social : 21 rue des Forgerons, 69002 Lyon,
          France.
        </p>
        <p>
          Directeur de la publication : Kenji Morita, en qualite de President. Contact : contact@katana-forge.com.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Hebergement</h2>
        <p>
          Le site Katana Forge est heberge par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, Etats-Unis.
          Telephone : +1 (559) 288-7060.
        </p>
        <p>
          Sauvegardes et donnees sont distribuees sur l infrastructure Vercel Edge Network afin de garantir
          performance et resilience.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Propriete intellectuelle</h2>
        <p>
          L ensemble des contenus presentes sur Katana Forge (textes, graphismes, logos, visuels 3D, videos) est protege
          par la legislation francaise et internationale relative a la propriete intellectuelle. Toute reproduction,
          representation ou diffusion, meme partielle, est strictement interdite sans autorisation ecrite prealable.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Responsabilite</h2>
        <p>
          Forge Studio SAS met tout en oeuvre pour assurer l exactitude des informations diffusees mais ne saurait etre
          tenue pour responsable des erreurs ou omissions, ni des consequences de leur utilisation. L utilisateur assume
          l integralite des risques lies a la consultation du site.
        </p>
      </section>
    </article>
  );
}
