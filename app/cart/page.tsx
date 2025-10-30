import CartClient from "./CartClient";

export default function CartPage() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12">
      <header className="text-center md:text-left">
        <h1 className="text-3xl font-semibold text-white">Votre panier</h1>
        <p className="mt-2 text-sm text-white/70">
          Retrouvez vos configurations enregistrees et finalisez votre commande en toute securite.
        </p>
      </header>

      <CartClient />
    </section>
  );
}
