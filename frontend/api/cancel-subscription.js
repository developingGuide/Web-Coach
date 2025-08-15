import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // needs service role for auth delete
);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId } = req.body; // Supabase user ID
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    // 1️⃣ Fetch subscription_id from your table
    const { data: userData, error: fetchError } = await supabase
      .from("user_state") // or "profiles" depending on where you stored it
      .select("subscription_id")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: "User not found or missing subscription" });
    }

    // 2️⃣ Cancel Stripe subscription if it exists
    if (userData.subscription_id) {
      await stripe.subscriptions.cancel(userData.subscription_id);
    }

    // 3️⃣ Delete related DB rows
    await supabase.from("user_state").delete().eq("user_id", userId);

    // 4️⃣ Delete user from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) throw deleteError;

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ error: "Failed to delete account", details: err.message });
  }
}
