// frontend/src/pages/SuccessPage.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./SuccessPage.css"

export default function SuccessPage() {
  const navigate = useNavigate()

  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedPlan = params.get("plan");
    setPlan(selectedPlan?.toLowerCase());
  }, []);

  return (
    <div className="centered-page">
      <h1>🎉 You're all set!</h1>
      <p>
        {
          plan === "warrior"
            ? "Welcome to the dojo! You now have access to daily challenges, progress tracking, and community features."
            : plan === "pro"
            ? "You’re now a Pro! Enjoy full access to everything — 1v1 battles, monthly championships, and more."
            : "Thanks for signing up!"
        }
      </p>
      <button onClick={() => {navigate('/login')}}>Go back to Log in!</button>
    </div>
  );
}
