const refundPolicy = [
  {
    title: "Droit de rétractation",
    description:
      "Les katanas étant fabriqués sur mesure, le droit de rétractation de 14 jours ne s’applique pas (article L221-28 du Code de la consommation). Toutefois, Katana Forge accepte une annulation sans frais tant que la forge n’a pas débuté.",
  },
  {
    title: "Annulation avant fabrication",
    description:
      "Si vous souhaitez annuler une commande avant lancement de la forge, contactez-nous rapidement à support@kfor.ge. Le remboursement intégral sera effectué sous 14 jours sur le moyen de paiement d’origine.",
  },
  {
    title: "Produit non conforme ou endommagé",
    description:
      "En cas de défaut constaté à la livraison, signalez-le sous 48 heures avec photos et numéro de commande. Après expertise, nous proposons réparation, remplacement ou remboursement partiel/total selon la gravité du défaut.",
  },
  {
    title: "Délais de remboursement",
    description:
      "Les remboursements validés sont traités sous 14 jours ouvrés. Un email de confirmation récapitulera la somme recréditée et le moyen de paiement utilisé.",
  },
  {
    title: "Contact service client",
    description:
      "Pour toute demande liée à un remboursement : support@kfor.ge — +33 1 23 45 67 89 (du lundi au vendredi, 9h00 – 18h00).",
  },
];

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header>
        <h1 className="text-3xl font-semibold">Politique de remboursement</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Cette politique s’applique à toutes les commandes passées via katanaforge.fr.
        </p>
      </header>

      <ol className="space-y-4">
        {refundPolicy.map((item) => (
          <li key={item.title} className="space-y-2">
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="text-neutral-700">{item.description}</p>
          </li>
        ))}
      </ol>

      <footer className="text-sm text-neutral-600">
        Dernière mise à jour : 21 octobre 2025.
      </footer>
    </main>
  );
}
