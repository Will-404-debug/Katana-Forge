import type { Metadata } from "next";

const LAST_UPDATE_ISO = "2025-10-15";
const LAST_UPDATE_LABEL = "15 octobre 2025";

export const metadata: Metadata = {
  title: "Politique de confidentialité | Katana Forge",
  description: "Présentation complète de la politique de confidentialité et du traitement des données personnelles.",
  alternates: {
    canonical: "/legal/confidentialite",
  },
  openGraph: {
    title: "Politique de confidentialité | Katana Forge",
    description: "Découvrez comment Katana Forge collecte, traite et protège vos données personnelles.",
    url: "https://katana-forge.example.com/legal/confidentialite",
  },
};

export default function ConfidentialitePage() {
  return (
    <article className="mx-auto grid max-w-4xl gap-10 px-6 py-16 text-white/70">
      <header className="space-y-3 text-white">
        <p className="text-xs uppercase tracking-[0.5em] text-emberGold">Legal</p>
        <h1 className="text-3xl font-heading uppercase tracking-[0.35em] md:text-4xl">Politique de confidentialité</h1>
        <p className="text-sm text-white/50">
          Derniere mise à jour : <time dateTime={LAST_UPDATE_ISO}>{LAST_UPDATE_LABEL}</time>
        </p>
      </header>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/40 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Principes généraux</h2>
        <p>
          Katana Forge collecte uniquement les donnees strictement nécessaires à l&apos;expérience de configuration et à la
          gestion de la relation client. Les traitements sont effectués conformément au Règlement Général sur la
          Protection des Données (RGPD) et reposent sur les fondements juridiques suivants : exécution du contrat,
          intérêt légitime pour la sécurisation de la plateforme et consentement pour la communication marketing.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Données collectées</h2>
        <ul className="space-y-2">
          <li>Identité : nom, prénom, adresse email et téléphone.</li>
          <li>Configuration : préférences d&apos;acier, tsuka, garde, lame et historique de devis.</li>
          <li>
            Données techniques : journaux anonymisés pour la sécurité, cookies de mesure d&apos;audience et identifiants de
            session.
          </li>
        </ul>
        <p>Les données sont conservées pour une durée maximale de 3 ans apres la dernière intéraction.</p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Vos droits</h2>
        <p>
          Vous disposez des droits d&apos;accès, de rectification, d&apos;éffacement, de limitation, d&apos;opposition et de portabilité
          sur vos données personnelles. Vous pouvez définir des directives relatives au sort de vos informations après
          votre décès.
        </p>
        <p>
          Pour exercer vos droits, adressez votre demande accompagnée d&apos;une preuve d&apos;identité a notre DPO via le contact
          ci-dessous. Une réponse vous sera apportée dans un délai d&apos;un mois maximum.
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
          Déleguée à la protection des données : Hanae Kobayashi. Adresse postale : Forge Studio SAS, 4 rue des
          Forgerons, 69002 Lyon, France.
        </p>
        <p>
          Email :{" "}
          <a className="underline decoration-emberGold/60 hover:text-emberGold" href="mailto:dpo@katana-forge.com">
            dpo@katana-forge.com
          </a>
          . Telephone : +33 (0)7 63 78 42 10.
        </p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 backdrop-blur">
        <h2 className="text-lg font-heading uppercase tracking-[0.3em] text-white">Sous-traitants</h2>
        <p>
          Katana Forge confie certaines prestations techniques à des tiers garantissant un niveau de sécurité conforme
          aux exigences du RGPD : Vercel (hébergement), Prisma (gestion des données), Mailjet (communication transactionnelle).
        </p>
        <p>
          Des clauses contractuelles types encadrent tout transfert en dehors de l&apos;Union européenne.
        </p>
      </section>
    </article>
  );
}
