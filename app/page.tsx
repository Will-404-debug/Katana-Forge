import Link from "next/link";
import dynamic from "next/dynamic";

const HeroParticles = dynamic(() => import("@/components/home/HeroParticles"), { ssr: false });

const featureItems = [
  "Configurateur 3D temps reel propulse par React Three Fiber",
  "Palette chromatique inspiree des forges nippones",
  "Controle precis du metalness, de la roughness et des teintes",
  "API de devis instantane motorisee par Prisma",
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#190909] to-[#501515]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,66,0.3),transparent_60%)]" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,56,56,0.25),transparent_55%)]" aria-hidden />
        <div className="absolute inset-0">
          <HeroParticles />
        </div>

        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-center gap-10 px-6 py-24 text-white">
          <div className="space-y-6 text-white/90">
            <p className="text-xs uppercase tracking-[0.6em] text-emberGold">Katana Forge</p>
            <h1 className="max-w-2xl text-4xl font-heading uppercase tracking-[0.25em] text-white md:text-6xl">
              Faconnez votre propre katana
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
              Un configurateur 3D immersif ou la tradition rencontre la technologie. Ajustez lame, garde et tsuka,
              observez la matiere reagir aux braises et obtenez un devis instantane sans quitter la page.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href="/atelier/demo" className="btn-slash bg-black px-8 py-3 text-xs uppercase tracking-[0.35em] text-white">
              Entrer dans l&apos;atelier
            </Link>
            <Link
              href="#technologies"
              className="btn-slash border border-white/20 bg-transparent px-7 py-3 text-xs uppercase tracking-[0.35em] text-white/80"
            >
              Stack technique
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.4fr_1fr] md:items-start">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-black/40 p-8 text-white/70 backdrop-blur">
          <h2 className="text-sm font-heading uppercase tracking-[0.4em] text-emberGold">Forge numerique</h2>
          <p className="text-sm leading-relaxed text-white/60 md:text-base">
            Katana Forge reunit Next.js 14, React Three Fiber et TailwindCSS pour livrer une experience fluide et
            responsive. Chaque interaction retranscrit la precision d une forge artisanale tout en restant pilotable
            depuis un navigateur moderne.
          </p>
          <ul className="grid gap-3 text-sm text-white/70 md:max-w-lg">
            {featureItems.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-md border border-white/10 bg-black/30 px-4 py-3"
              >
                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emberGold" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <aside
          id="technologies"
          className="space-y-4 rounded-3xl border border-white/10 bg-black/30 p-8 text-xs uppercase tracking-[0.4em] text-white/60 backdrop-blur"
        >
          <h3 className="text-sm font-heading uppercase tracking-[0.45em] text-emberGold">Stack technique</h3>
          <p className="text-white/50">
            Un socle moderne pret a l emploi : API serverless, Prisma, auth JWT et assets 3D optimises.
          </p>
          <div className="space-y-3 text-white/60">
            <p>Next.js 14 • App Router</p>
            <p>TypeScript • React 18</p>
            <p>React Three Fiber • Drei</p>
            <p>TailwindCSS personnalise</p>
            <p>Prisma • Zod • JWT</p>
          </div>
        </aside>
      </section>
    </>
  );
}
