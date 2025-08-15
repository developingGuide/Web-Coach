// frontend/src/pages/SuccessPage.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";
import "./SuccessPage.css"
import { fireConfetti } from "../utils/confetti";

export default function SuccessPage() {
  const navigate = useNavigate()

  const [plan, setPlan] = useState(null);
  const [status, setStatus] = useState()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");
    const sessionId = params.get("session_id");

    const email = sessionStorage.getItem("email");
    const password = sessionStorage.getItem("password");
    const display_name = sessionStorage.getItem("display_name");

    const doSignup = async () => {
      if (!email || !password || !display_name || !plan || !sessionId) {
        setStatus("Missing signup info.");
        return;
      }

      // For Testing
      // 1️⃣ Get subscription_id from backend
      // const subRes = await fetch("http://localhost:4000/get-subscription-id", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ sessionId })
      // });



      const subRes = await fetch("/api/get-subscription-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId })
      });

      const { subscriptionId } = await subRes.json();
      if (!subscriptionId) {
        setStatus("Could not get subscription info.");
        return;
      }

      // 2️⃣ Sign up user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name, plan, subscription_id: subscriptionId } },
      });

      if (error) {
        setStatus("Signup error: " + error.message);
        return;
      }

      if (data.session) {
        const user = data.session.user;

        // 3️⃣ Insert to user_state with subscription_id
        const { error: insertError } = await supabase.from("user_state").upsert({
          user_id: user.id,
          display_name,
          plan: plan.toLowerCase(),
          subscription_id: subscriptionId,
        });

        if (insertError) console.error("Insert error:", insertError.message);

        fireConfetti();
        setStatus("Account created! Redirecting...");
        setTimeout(() => navigate("/newUser"), 1500);
      } else {
        setStatus("No session returned — check if email confirmation is still enabled.");
      }
    };

    doSignup();
  }, []);



  return (
    <div className="centered-page">
      <div className="success-card">
        <h2>{status || "Creating your account..."}</h2>
      </div>
    </div>
  );
}
