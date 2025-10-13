import type { Metadata } from "next";

const LAST_UPDATE_ISO = "2025-10-12";
const LAST_UPDATE_LABEL = "12 octobre 2025";

export const metadata: Metadata = {
  title: "Conditions generales de vente | Katana Forge",
  description: "Consultez les conditions generales de vente de Katana Forge avant toute commande.",
  alternates: {
    canonical: "/legal/cgv",
  },
  openGraph: {
    title: "Conditions generales de vente | Katana Forge",
    description: "Regles applicables aux ventes, tarifs et garanties de Katana Forge.",
    url: "https://katana-forge.example.com/legal/cgv",
  },
};

export default function CgvPage() {
  return (
    <article className="mx-auto grid max-w-4xl gap-10 px-6 py-16 text-white/70">
      <header className="space-y-3 text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-emberGold">Legal</p>
        <h1 className="text-3xl font-heading uppercase tracking-[0.35em] md:text-4xl">Conditions generales de vente</h1>
        <p className="text-sm text-white/50">
          Derniere mise a jour : <time dateTime={LAST_UPDATE_ISO}>{LAST_UPDATE_LABEL}</time>
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Objet</h2>
        <p>
          Les presentes conditions generales de vente (CGV) regissent les ventes realisees via le configurateur Katana
          Forge. Toute commande suppose l acceptation pleine et entiere des CGV par le client professionnel ou
          particulier.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Tarifs et paiement</h2>
        <p>
          Les prix affiches sur le configurateur sont exprimes en euros hors taxes. Un devis detaille est genere en fin
          de configuration et valide durant 30 jours. Le paiement s effectue via virement bancaire ou carte bancaire
          securisee a hauteur de 40 pour cent d acompte, le solde etant du a la livraison.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Production et delais</h2>
        <p>
          La conception sur-mesure demarre des reception de l acompte. Les delais moyens de fabrication sont de 8 a 10
          semaines selon la complexite des finitions demandees. Katana Forge informera le client de tout retard majeur et
          proposera, le cas echeant, une nouvelle echeance ou un remboursement.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Garanties</h2>
        <p>
          Les katanas beneficient d une garantie de conformite de 24 mois couvrant les defauts de forge et de materiau.
          Toute demande doit etre formulee par ecrit avec photo et numero de commande. Les dommages resultant d une
          utilisation non conforme ne sont pas couverts.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Service client</h2>
        <p>
          Pour toute question relative a une commande, contactez atelier@katana-forge.com en precisant votre numero de
          devis ou appelez le +33 (0)4 72 00 45 40 du lundi au vendredi, 9h00 a 18h00.
        </p>
      </section>
    </article>
  );
}
