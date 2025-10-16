import Link from "next/link";

const legalLinks = [
  { href: "/legal/mentions-legales", label: "Mentions legales" },
  { href: "/legal/confidentialite", label: "Confidentialite" },
  { href: "/legal/cgv", label: "Conditions generales de vente" },
  { href: "/legal/livraison", label: "Livraison" },
  { href: "/legal/remboursement", label: "Remboursement" },
  { href: "/legal/confidentialite#contact-DPO", label: "Contact DPO" },
];

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black/50 text-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.45em] text-emberGold">Katana Forge</p>
          <p className="max-w-md text-white/60">
            Atelier numérique de forge sur-mesure, mêlant tradition et innovation pour concevoir des katanas uniques.
          </p>
          <p className="text-xs text-white/40">
            Version éditoriale&nbsp;
            <time dateTime="2025-10-12">12 octobre 2025</time>
          </p>
        </div>

        <nav aria-label="Navigation legale" className="grid gap-2 text-xs uppercase tracking-[0.35em] text-white/60 md:text-right">
          {legalLinks.map((link) => (
            <Link key={link.href} href={link.href as any} className="transition hover:text-emberGold">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 bg-black/40 px-6 py-4 text-center text-[0.65rem] uppercase tracking-[0.4em] text-white/40">
        Copyright {currentYear} Katana Forge - Tous droits réservés
      </div>
    </footer>
  );
}
