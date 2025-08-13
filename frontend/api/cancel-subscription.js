import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscriptionId } = req.body; // You need to have this stored

  try {
    const deleted = await stripe.subscriptions.cancel(subscriptionId);
    return res.status(200).json({ message: 'Subscription cancelled', deleted });
  } catch (err) {
    console.error('Stripe cancel error:', err);
    return res.status(500).json({ error: 'Failed to cancel subscription', details: err.message });
  }
}
