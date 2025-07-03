// frontend/src/pages/SuccessPage.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import supabase from "../../config/supabaseClient";
import "./SuccessPage.css"

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
          emailRedirectTo: "http://localhost:5173/newUser", // after email verify
        },
      });

      if (error) {
        setStatus("Signup error: " + error.message);
      } else {
        // Insert into user_state once user is available
        const user = data?.user;
        if (user) {
          await supabase.from("user_state").upsert({
            user_id: user.id,
            display_name,
            plan: plan.toLowerCase(), // e.g., "warrior", "pro"
          });
        }

        setStatus("Check your email to confirm your account!");
      }
    };

    doSignup();
  }, []);


  return (
    // <div className="centered-page">
    //   <h1>🎉 You're all set!</h1>
    //   <p>
    //     {
    //       plan === "warrior"
    //         ? "Welcome to the dojo! You now have access to daily challenges, progress tracking, and community features."
    //         : plan === "pro"
    //         ? "You’re now a Pro! Enjoy full access to everything — 1v1 battles, monthly championships, and more."
    //         : "Thanks for signing up!"
    //     }
    //   </p>
    //   <button onClick={() => {navigate('/login')}}>Go back to Log in!</button>
    // </div>
    <div className="centered-page">
      <h1>{status}</h1>
    </div>
  );
}
