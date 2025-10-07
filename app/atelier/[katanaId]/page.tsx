import ConfiguratorClient from "./ConfiguratorClient";

const FALLBACK_BASE_PRICE = 420;

type KatanaAtelierPageProps = {
  params: {
    katanaId: string;
  };
};

export default function KatanaAtelierPage({ params }: KatanaAtelierPageProps) {
  const basePrice = Number(process.env.BASE_PRICE ?? FALLBACK_BASE_PRICE);

  return (
    <section className="mx-auto max-w-6xl space-y-10 px-6 py-12">
      <ConfiguratorClient katanaId={params.katanaId} basePrice={basePrice} />
    </section>
  );
}
