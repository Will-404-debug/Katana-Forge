import type { Metadata } from "next";

const LAST_UPDATE_ISO = "2025-10-16";
const LAST_UPDATE_LABEL = "16 octobre 2025";

export const metadata: Metadata = {
  title: "Politique de livraison | Katana Forge",
  description: "Informations sur les modes, zones et délais de livraison des katanas Katana Forge.",
  alternates: {
    canonical: "/legal/livraison",
  },
  openGraph: {
    title: "Politique de livraison | Katana Forge",
    description: "Tout savoir sur la logistique et la livraison de vos commandes Katana Forge.",
    url: "https://katana-forge.example.com/legal/livraison",
  },
};

export default function LivraisonPage() {
  return (
    <article className="mx-auto grid max-w-4xl gap-10 px-6 py-16 text-white/70">
      <header className="space-y-3 text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-emberGold">Legal</p>
        <h1 className="text-3xl font-heading uppercase tracking-[0.35em] md:text-4xl">Politique de livraison</h1>
        <p className="text-sm text-white/50">
          Derniere mise à jour : <time dateTime={LAST_UPDATE_ISO}>{LAST_UPDATE_LABEL}</time>
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Zones desservies</h2>
        <p>
          Katana Forge livre en France métropolitaine, dans l'Union européenne et en Amerique du Nord. Pour toute autre
          destination, un devis logistique personnalisé est établi.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Modes d'expédition</h2>
        <p>
          Les lames sont expédiées via transporteur spécialisé, avec assurance ad valorem et remise contre signature.
          Un numero de suivi est communiqué dès la prise en charge.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Délais indicatifs</h2>
        <ul className="space-y-2">
          <li>France métropolitaine : 2 à 4 jours ouvrables après expédition.</li>
          <li>Union européenne : 4 à 6 jours ouvrables.</li>
          <li>Amerique du Nord : 6 à 9 jours ouvrables.</li>
        </ul>
        <p>
          Les délais peuvent varier en fonction des formalités douanières. Katana Forge vous tient informé en cas
          d'incident de transport.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Vérification à réception</h2>
        <p>
          Lors de la livraison, controlez l'état du colis avant signature. En cas d'avarie, formulez des réserves
          précises sur le bon du transporteur et contactez-nous sous 48 heures à logistique@katana-forge.com.
        </p>
      </section>
    </article>
  );
}
