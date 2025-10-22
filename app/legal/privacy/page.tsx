const sections = [
  {
    title: "Responsable de traitement",
    body: [
      "Katana Forge SAS, 123 Rue du Sabre, 75000 Paris, France",
      "Contact DPO : privacy@kfor.ge",
    ],
  },
  {
    title: "Finalités et bases légales",
    body: [
      "Gestion des devis et commandes (exécution contractuelle).",
      "Paiement en ligne via Stripe (exécution contractuelle).",
      "Envoi d’emails transactionnels (intérêt légitime).",
      "Amélioration du configurateur et prévention de la fraude (intérêt légitime).",
    ],
  },
  {
    title: "Données collectées",
    body: [
      "Informations d’identification : nom, prénom, email, téléphone, adresses.",
      "Historique de configuration, devis, commandes et paiements (token Stripe).",
      "Logs techniques (adresse IP, navigateur) conservés 12 mois à des fins de sécurité.",
    ],
  },
  {
    title: "Durée de conservation",
    body: [
      "Devis et documents contractuels : 3 ans.",
      "Données de compte : pendant la durée d’usage du service puis 2 ans après inactivité.",
      "Justificatifs comptables : 10 ans conformément aux obligations légales.",
    ],
  },
  {
    title: "Partage et sous-traitants",
    body: [
      "Stripe (paiement sécurisé) — https://stripe.com/fr/privacy.",
      "Vercel (hébergement) — https://vercel.com/legal/privacy-policy.",
      "Mailhog / SMTP ou Resend pour l’envoi des emails transactionnels.",
    ],
  },
  {
    title: "Vos droits",
    body: [
      "Accès, rectification, suppression, limitation, portabilité, opposition.",
      "Retrait du consentement à tout moment pour les traitements basés sur celui-ci.",
      "Dépôt d’une réclamation auprès de la CNIL (www.cnil.fr).",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header>
        <h1 className="text-3xl font-semibold">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Katana Forge protège vos données personnelles conformément au Règlement Général
          sur la Protection des Données (RGPD) et à la législation française.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <ul className="list-disc space-y-1 pl-5 text-neutral-700">
            {section.body.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Exercer vos droits</h2>
        <p className="text-neutral-700">
          Adressez vos demandes à privacy@kfor.ge ou par courrier recommandé à Katana Forge,
          DPO, 123 Rue du Sabre, 75000 Paris. Nous répondrons sous 30 jours.
        </p>
      </section>

      <footer className="text-sm text-neutral-600">
        Dernière mise à jour : 21 octobre 2025.
      </footer>
    </main>
  );
}
