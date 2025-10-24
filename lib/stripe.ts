import Stripe from "stripe";

let client: Stripe | null = null;

export const getStripe = () => {
  if (!client) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) {
      throw new Error("STRIPE_SECRET_KEY must be defined to use Stripe APIs");
    }

    client = new Stripe(secret, {
      apiVersion: "2024-06-20" as Stripe.StripeConfig["apiVersion"],
      typescript: true,
    });
  }

  return client;
};
