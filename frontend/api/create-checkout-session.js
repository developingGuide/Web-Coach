// File: /api/create-checkout-session.js

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { email, display_name, priceId, planName } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `https://devsim.fun/success?plan=${planName}&email=${email}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://devsim.fun/cancel`,
      metadata: { display_name },
    });

    res.status(200).json({ url: session.url });
  }
  catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: 'Stripe session creation failed', details: err.message });
  }
}