require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/create-checkout-session", async (req, res) => {
<<<<<<< HEAD
  const { email, display_name, priceId, planName } = req.body;
=======
  const { email, display_name } = req.body;
>>>>>>> 0e1e7c4b6e793b79d7bb1c6ab15c02605663cc14

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
<<<<<<< HEAD
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/success?plan=${planName}&email=${email}`,
=======
          price: "price_1RZtZYJomOLGn4VAZonkQ56V", // Replace with your actual Stripe price ID
          quantity: 1,
        },
      ],
      success_url: `http://localhost:5173/success?email=${email}`,
>>>>>>> 0e1e7c4b6e793b79d7bb1c6ab15c02605663cc14
      cancel_url: "https://devsim.app/cancel",
      metadata: { display_name },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Stripe session creation failed" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
