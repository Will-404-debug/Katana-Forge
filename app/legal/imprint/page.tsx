export default function ImprintPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <header>
        <h1 className="text-3xl font-semibold">Mentions légales</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Informations requises par la loi française n° 2004-575 du 21 juin 2004 pour la
          confiance dans l&apos;économie numérique.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Éditeur du site</h2>
        <p>Katana Forge SAS</p>
        <p>Capital social : 50 000 €</p>
        <p>SIRET : 000 000 000 00000</p>
        <p>TVA intracommunautaire : FRXX999999999</p>
        <p>Siège social : 123 Rue du Sabre, 75000 Paris, France</p>
        <p>
          Téléphone : +33 1 23 45 67 89 — Email :{" "}
          <a className="underline" href="mailto:legal@kfor.ge">
            legal@kfor.ge
          </a>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Directeur de la publication</h2>
        <p>Jean Forgeron, Président.</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Hébergement</h2>
        <p>Vercel Inc.</p>
        <p>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
        <p>Site : https://vercel.com — Support : support@vercel.com</p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Propriété intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus, logos, visuels et éléments graphiques présents sur le
          site katanaforge.fr sont protégés par le Code de la propriété intellectuelle.
          Toute reproduction ou représentation, totale ou partielle, sans autorisation
          écrite, est interdite.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Responsabilité</h2>
        <p>
          Katana Forge met tout en œuvre pour assurer l&apos;exactitude des informations
          publiées mais ne peut garantir l&apos;absence d&apos;erreurs ou d&apos;omissions.
          L&apos;utilisateur reste responsable de l&apos;utilisation qu&apos;il fait du site
          et des services associés.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Nous contacter</h2>
        <p>
          Pour toute question relative aux mentions légales, merci d&apos;écrire à{" "}
          <a className="underline" href="mailto:legal@kfor.ge">
            legal@kfor.ge
          </a>{" "}
          ou par courrier postal à Katana Forge, Service juridique, 123 Rue du Sabre, 75000
          Paris.
        </p>
      </section>
    </main>
  );
}
