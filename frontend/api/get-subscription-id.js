// serverless/api route
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: "Missing sessionId" });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"]
    });

    const subscriptionId = session.subscription.id;
    res.status(200).json({ subscriptionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to retrieve subscription" });
  }
}
