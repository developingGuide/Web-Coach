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

    const email = sessionStorage.getItem("email");
    const password = sessionStorage.getItem("password");
    const display_name = sessionStorage.getItem("display_name");

    const doSignup = async () => {
      if (!email || !password || !display_name || !plan) {
        setStatus("Missing signup info.");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name, plan },
        },
      });

      if (error) {
        setStatus("Signup error: " + error.message);
        return;
      }

      if (data.session) {
        // User is already signed in
        const user = data.session.user;

        // Insert to user_state (optional, if needed here)
        const { error: insertError } = await supabase.from("user_state").upsert({
          user_id: user.id,
          display_name,
          plan: plan.toLowerCase(),
        });

        if (insertError) {
          console.error("Insert error:", insertError.message);
        }

        fireConfetti()
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
