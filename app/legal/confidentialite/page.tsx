import type { Metadata } from "next";

const LAST_UPDATE_ISO = "2025-10-12";
const LAST_UPDATE_LABEL = "12 octobre 2025";

export const metadata: Metadata = {
  title: "Politique de confidentialite | Katana Forge",
  description: "Presentation complete de la politique de confidentialite et du traitement des donnees personnelles.",
  alternates: {
    canonical: "/legal/confidentialite",
  },
  openGraph: {
    title: "Politique de confidentialite | Katana Forge",
    description: "Decouvrez comment Katana Forge collecte, traite et protege vos donnees personnelles.",
    url: "https://katana-forge.example.com/legal/confidentialite",
  },
};

export default function ConfidentialitePage() {
  return (
    <article className="mx-auto grid max-w-4xl gap-10 px-6 py-16 text-white/70">
      <header className="space-y-3 text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-emberGold">Legal</p>
        <h1 className="text-3xl font-heading uppercase tracking-[0.35em] md:text-4xl">Politique de confidentialite</h1>
        <p className="text-sm text-white/50">
          Derniere mise a jour : <time dateTime={LAST_UPDATE_ISO}>{LAST_UPDATE_LABEL}</time>
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Principes generaux</h2>
        <p>
          Katana Forge collecte uniquement les donnees strictement necessaires a l experience de configuration et a la
          gestion de la relation client. Les traitements sont effectues conformement au Reglement general sur la
          protection des donnees (RGPD) et reposent sur les fondements juridiques suivants : execution du contrat,
          interet legitime pour la securisation de la plateforme et consentement pour la communication marketing.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Donnees collecte</h2>
        <ul className="space-y-2">
          <li>Identite : nom, prenom, adresse email et telephone.</li>
          <li>Configuration : preferences d acier, tsuka, garde et historique de devis.</li>
          <li>
            Donnees techniques : journaux anonymises pour la securite, cookies de mesure d audience et identifiants de
            session.
          </li>
        </ul>
        <p>Les donnees sont conservees pour une duree maximale de 3 ans apres la derniere interaction.</p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Vos droits</h2>
        <p>
          Vous disposez des droits d acces, de rectification, d effacement, de limitation, d opposition et de portabilite
          sur vos donnees personnelles. Vous pouvez definir des directives relatives au sort de vos informations apres
          votre deces.
        </p>
        <p>
          Pour exercer vos droits, adressez votre demande accompagnee d une preuve d identite a notre DPO via le contact
          ci-dessous. Une reponse vous sera apportee dans un delai d un mois maximum.
        </p>
      </section>

      <section
        id="contact-DPO"
        className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur"
        aria-labelledby="contact-dpo-heading"
      >
        <h2 id="contact-dpo-heading" className="text-lg font-heading uppercase tracking-[0.3em] text-white">
          Contact DPO
        </h2>
        <p>
          Delegue a la protection des donnees : Hanae Kobayashi. Adresse postale : Forge Studio SAS, 21 rue des
          Forgerons, 69002 Lyon, France.
        </p>
        <p>
          Email :{" "}
          <a className="underline decoration-emberGold/60 hover:text-emberGold" href="mailto:dpo@katana-forge.com">
            dpo@katana-forge.com
          </a>
          . Telephone : +33 (0)4 72 00 45 60.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Sous-traitants</h2>
        <p>
          Katana Forge confie certaines prestations techniques a des tiers garantissant un niveau de securite conforme
          aux exigences du RGPD : Vercel (hebergement), Prisma (gestion des donnees), Mailjet (communication transactionnelle).
        </p>
        <p>
          Des clauses contractuelles types encadrent tout transfert en dehors de l Union europeenne.
        </p>
      </section>
    </article>
  );
}
