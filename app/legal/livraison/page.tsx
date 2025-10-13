import type { Metadata } from "next";

const LAST_UPDATE_ISO = "2025-10-12";
const LAST_UPDATE_LABEL = "12 octobre 2025";

export const metadata: Metadata = {
  title: "Politique de livraison | Katana Forge",
  description: "Informations sur les modes, zones et delais de livraison des katanas Katana Forge.",
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
          Derniere mise a jour : <time dateTime={LAST_UPDATE_ISO}>{LAST_UPDATE_LABEL}</time>
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Zones desservies</h2>
        <p>
          Katana Forge livre en France metropolitaine, dans l Union europeenne et en Amerique du Nord. Pour toute autre
          destination, un devis logistique personnalise est etabli.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Modes d expedition</h2>
        <p>
          Les lames sont expediees via transporteur specialise, avec assurance ad valorem et remise contre signature.
          Un numero de suivi est communique des la prise en charge.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Delais indicatifs</h2>
        <ul className="space-y-2">
          <li>France metropolitaine : 2 a 4 jours ouvrables apres expedition.</li>
          <li>Union europeenne : 4 a 6 jours ouvrables.</li>
          <li>Amerique du Nord : 6 a 9 jours ouvrables.</li>
        </ul>
        <p>
          Les delais peuvent varier en fonction des formalites douanieres. Katana Forge vous tient informe en cas
          d incident de transport.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Verification a reception</h2>
        <p>
          Lors de la livraison, controlez l etat du colis avant signature. En cas d avarie, formulez des reserves
          precises sur le bon du transporteur et contactez-nous sous 48 heures a logistique@katana-forge.com.
        </p>
      </section>
    </article>
  );
}
