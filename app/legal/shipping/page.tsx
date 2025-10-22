const sections = [
  {
    title: "Zones desservies",
    content:
      "Katana Forge livre en France métropolitaine, en Belgique, en Suisse et dans l’Union européenne. Pour toute autre destination, merci de nous écrire afin d’établir un devis logistique dédié.",
  },
  {
    title: "Délais de fabrication et d’expédition",
    content:
      "Chaque katana est forgé à la commande. Le délai moyen est de 6 à 8 semaines, auquel s’ajoutent 3 à 5 jours ouvrés d’expédition. Un suivi colis est communiqué par email dès prise en charge par le transporteur.",
  },
  {
    title: "Frais de livraison",
    content:
      "Les frais sont calculés au moment du devis en fonction du poids, de la destination et de l’assurance transport. Ils sont indiqués TTC et comprennent la préparation, l’emballage et l’assurance.",
  },
  {
    title: "Réception du colis",
    content:
      "À la livraison, vérifiez l’intégrité du colis. En cas d’anomalie (casse, choc, produit manquant), formulez immédiatement des réserves détaillées sur le bon du transporteur et contactez notre service client sous 48 heures.",
  },
  {
    title: "Service client",
    content:
      "support@kfor.ge — +33 1 23 45 67 89 (du lundi au vendredi, 9h00 – 18h00).",
  },
];

export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header>
        <h1 className="text-3xl font-semibold">Conditions de livraison</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Informations relatives à la livraison de vos créations Katana Forge.
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
