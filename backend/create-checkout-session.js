require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express(); //Remove this during launch
app.use(cors()); //Remove this during launch
app.use(express.json()); //Remove this during launch

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Remove below during launch
app.post("/create-checkout-session", async (req, res) => {
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
      success_url: `http://localhost:5173/success?plan=${planName}&email=${email}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: "http://localhost:5173/cancel",
      metadata: { display_name },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

app.post("/get-subscription-id", async (req, res) => {
  const { sessionId } = req.body;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    const subscriptionId = session.subscription.id;
    res.json({ subscriptionId });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ error: "Failed to get subscription", details: err.message });
  }
});

app.post("/delete-account", async (req, res) => {
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
});


app.post("/upgrade-subscription", async (req, res) => {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  try {
    const { sessionId, userId } = req.body;

    // Retrieve the Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription"],
    });

    // Get subscription ID
    const subscriptionId = session.subscription.id;

    // Update Supabase record
    const { error } = await supabase
      .from("user_state")
      .update({
        plan: "warrior",
        subscription_id: subscriptionId,
      })
      .eq("id", userId);

    if (error) throw error;

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
})


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));