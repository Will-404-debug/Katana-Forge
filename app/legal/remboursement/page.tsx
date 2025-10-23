import type { Metadata } from "next";

const LAST_UPDATE_ISO = "2025-10-16";
const LAST_UPDATE_LABEL = "16 octobre 2025";

export const metadata: Metadata = {
  title: "Politique de remboursement | Katana Forge",
  description: "Conditions de rétractation, d'annulation et de remboursement pour Katana Forge.",
  alternates: {
    canonical: "/legal/remboursement",
  },
  openGraph: {
    title: "Politique de remboursement | Katana Forge",
    description: "Consultez les modalités de remboursement et de rétractation de Katana Forge.",
    url: "https://katana-forge.example.com/legal/remboursement",
  },
};

export default function RemboursementPage() {
  return (
    <article className="mx-auto grid max-w-4xl gap-10 px-6 py-16 text-white/70">
      <header className="space-y-3 text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-emberGold">Legal</p>
        <h1 className="text-3xl font-heading uppercase tracking-[0.35em] md:text-4xl">Politique de remboursement</h1>
        <p className="text-sm text-white/50">
          Derniere mise à jour : <time dateTime={LAST_UPDATE_ISO}>{LAST_UPDATE_LABEL}</time>
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Droit de rétractation</h2>
        <p>
          Les créations Katana Forge étant personnalisées et fabriquées sur commande, elles ne bénéficient pas du droit
          légal de rétractation de 14 jours prévu pour les biens standards. Toutefois, une annulation reste possible dans
          un délai de 48 heures après confirmation de la commande, contre frais de dossier de 10 pour cent.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Annulation par Katana Forge</h2>
        <p>
          Katana Forge se résèrve le droit d annuler une commande lorsque des contraintes techniques ou règlementaires
          l&apos;imposent. Dans ce cas, toutes les sommes versées sont intégralement remboursées sous 7 jours ouvrables.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Procédure de remboursement</h2>
        <p>
          Les remboursements sont effectués par le moyen de paiement initial ou par virement bancaire. Un email de
          confirmation est adressé au client au moment de l&apos;émission du remboursement.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Garanties légales</h2>
        <p>
          Les garanties légales de conformité et des vices caches demeurent applicables. Pour solliciter une prise en
          charge, contactez atelier@katana-forge.com avec votre numéro de commande et une description précise du défaut.
        </p>
      </section>
    </article>
  );
}
