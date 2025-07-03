import { useState } from "react";
import "./Auth.css";
import supabase from "../../config/supabaseClient";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For curious minds just starting out.",
    features: ["2 Tasks/day", "Daily Tracking"],
    highlighted: false,
  },
  {
    name: "Warrior",
    price: "$9/mo",
    description: "For learners who want to compete.",
    features: ["8 Tasks/day", "Daily Tracking", "Coding Battles & Leaderboards"],
    highlighted: true,
    priceId: "price_1RaRJgJomOLGn4VAJGjdGU1I"
  },
  {
    name: "Pro",
    price: "$19/mo",
    description: "Unlock unlimited tasks, community, and courses.",
    features: ["UNLIMITED Tasks/day", "Daily Tracking", "Coding Battles & Leaderboards", "Community", "Courses (coming soon)"],
    highlighted: true,
    priceId: "price_1RZtZYJomOLGn4VAZonkQ56V"
  }
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    display_name: "",
  });
  const [display_name, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate()

  const handleNext = (e) => {
    e.preventDefault();
    if (email && password && display_name) {
      setStep(2);
    }
  };

  const handlePlanClick = async (plan) => {
    if (plan.name === "Starter") {
      console.log("Free plan selected!");
      window.alert("Check your email to confirm your account!");
      const {error: signUpError} = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: "http://localhost:5173/newUser",
            data: {display_name}
        }
      });
      
      if(signUpError) {
        console.error(signUpError)
      } else{
        navigate("/login")
      }
    } else {
      // Call your Stripe endpoint
      try {
        const res = await fetch("http://localhost:4000/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            display_name,
            priceId: plan.priceId,
            planName: plan.name
           }),
        });

        // Save to local/session storage
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("password", password);
        sessionStorage.setItem("display_name", display_name);


        const { url } = await res.json();
        window.location.href = url; // Redirect to Stripe Checkout
      } catch (err) {
        console.error("Stripe checkout error:", err);
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-card ${step === 2 ? "wide" : ""}`}>
        {step === 1 && (
          <>
            <h2>Create Your Account</h2>
            <form className="auth-form" onSubmit={handleNext}>
              <input
                type="text"
                placeholder="Display Name"
                value={display_name}
                onChange={(e) =>
                  setDisplayName(e.target.value)
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />
              <button type="submit">Next</button>
            </form>
            <p className="auth-link">
                Already have an account?{" "}
                <span onClick={() => navigate("/login")}>Log in here</span>
            </p>
          </>
        )}

        {step === 2 && (
          <div className="pricing-section">
            <h2 className="section-title">Choose Your Path</h2>
            <p className="section-subtitle">
              Level up at your pace. Start free, upgrade anytime.
            </p>

            <div className="pricing-cards">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`pricing-card ${
                    plan.highlighted ? "highlighted" : ""
                  }`}
                >
                  <div className="price">{plan.price}</div>
                  <div className="plan-name">{plan.name}</div>
                  <div className="plan-desc">{plan.description}</div>

                  <button
                    className="get-started-btn"
                    onClick={() => handlePlanClick(plan)}
                  >
                    Get Started
                  </button>

                  <ul className="features-list">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="tick">✔</span> <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
