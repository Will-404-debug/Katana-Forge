import type { Metadata } from "next";

const LAST_UPDATE_ISO = "2025-10-15";
const LAST_UPDATE_LABEL = "15 octobre 2025";

export const metadata: Metadata = {
  title: "Conditions générales de vente | Katana Forge",
  description: "Consultez les conditions générales de vente de Katana Forge avant toute commande.",
  alternates: {
    canonical: "/legal/cgv",
  },
  openGraph: {
    title: "Conditions générales de vente | Katana Forge",
    description: "Règles applicables aux ventes, tarifs et garanties de Katana Forge.",
    url: "https://katana-forge.example.com/legal/cgv",
  },
};

export default function CgvPage() {
  return (
    <article className="mx-auto grid max-w-4xl gap-10 px-6 py-16 text-white/70">
      <header className="space-y-3 text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-emberGold">Legal</p>
        <h1 className="text-3xl font-heading uppercase tracking-[0.35em] md:text-4xl">Conditions générales de vente</h1>
        <p className="text-sm text-white/50">
          Dernière mise à jour : <time dateTime={LAST_UPDATE_ISO}>{LAST_UPDATE_LABEL}</time>
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Objet</h2>
        <p>
          Les présentes conditions générales de vente (CGV) régissent les ventes réalisées via le configurateur Katana
          Forge. Toute commande suppose l'acceptation pleine et entière des CGV par le client professionnel ou
          particulier.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Tarifs et paiement</h2>
        <p>
          Les prix affichés sur le configurateur sont exprimés en euros hors taxes. Un devis detaillé est généré en fin
          de configuration et valide durant 30 jours. Le paiement s'effectue via virement bancaire ou carte bancaire
          securisée à hauteur de 40 pour cent d'acompte, le solde étant dû à la livraison.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Production et délais</h2>
        <p>
          La conception sur-mesure démarre des réception de l'acompte. Les délais moyens de fabrication sont de 4 a 8
          semaines selon la complexité des finitions demandées. Katana Forge informera le client de tout retard majeur et
          proposera, le cas écheant, une nouvelle échéance ou un remboursement.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Garanties</h2>
        <p>
          Les katanas bénéficient d'une garantie de conformité de 24 mois couvrant les défauts de forge et de matériau.
          Toute demande doit être formulée par écrit avec photo et numéro de commande. Les dommages résultant d'une
          utilisation non conforme ne sont pas couverts.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Service client</h2>
        <p>
          Pour toute question relative à une commande, contactez atelier@katana-forge.com en précisant votre numéro de
          devis ou appelez le +33 (0)7 63 78 42 10 du lundi au vendredi, 9h00 a 18h00.
        </p>
      </section>
    </article>
  );
}
