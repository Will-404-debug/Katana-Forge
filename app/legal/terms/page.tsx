const sections = [
  {
    title: "Objet",
    content:
      "Les présentes conditions d’utilisation (ci-après « CGU ») encadrent l’accès au site katanaforge.fr et l’usage des services de personnalisation, de devis et de commande proposés par Katana Forge.",
  },
  {
    title: "Accès au service",
    content:
      "L’accès au configurateur et à l’espace client nécessite la création d’un compte et l’acceptation des CGU. L’utilisateur s’engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.",
  },
  {
    title: "Processus de commande",
    content:
      "Toute demande de devis vaut engagement à fournir des informations fidèles. La commande est réputée ferme après signature numérique du devis ou règlement via Stripe. Un email de confirmation récapitule les caractéristiques du katana, les délais et les modalités de livraison.",
  },
  {
    title: "Prix et paiement",
    content:
      "Les prix sont indiqués en euros toutes taxes comprises. Le paiement sécurisé est assuré par Stripe. Katana Forge ne stocke pas les données de carte bancaire. Les devis sont valables 15 jours à compter de leur émission.",
  },
  {
    title: "Obligations de l’utilisateur",
    content:
      "L’utilisateur s’interdit toute utilisation frauduleuse ou détournée du service (extraction automatisée, reverse engineering, diffusion d’éléments de propriété intellectuelle). Le non-respect des CGU peut entraîner la suspension du compte.",
  },
  {
    title: "Service client",
    content:
      "Pour toute question, contactez notre service client à support@kfor.ge ou au +33 1 23 45 67 89 (du lundi au vendredi, 9h00 – 18h00).",
  },
  {
    title: "Droit applicable",
    content:
      "Les CGU sont soumises au droit français. Tout litige sera porté devant les tribunaux compétents du ressort de Paris.",
  },
];

export default function TermsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header>
        <h1 className="text-3xl font-semibold">Conditions d’utilisation</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Merci de lire attentivement ces conditions avant d’utiliser les services Katana
          Forge.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.title} className="space-y-2">
          <h2 className="text-xl font-semibold">{section.title}</h2>
          <p className="text-neutral-700">{section.content}</p>
        </section>
      ))}

      <footer className="text-sm text-neutral-600">
        Dernière mise à jour : 21 octobre 2025.
      </footer>
    </main>
  );
}
