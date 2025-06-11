import { useState } from "react";
import "./Auth.css";
import supabase from "../../config/supabaseClient";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For curious minds just starting out.",
    features: ["Basic challenges", "Community access"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9/mo",
    description: "For learners who want more guidance.",
    features: ["All Starter features", "Daily projects", "Progress tracking"],
    highlighted: true,
  },
  {
    name: "Legend",
    price: "$29/mo",
    description: "For serious devs building real skills fast.",
    features: ["Everything in Pro", "1v1 Feedback", "Monthly Championship"],
    highlighted: false,
  },
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
      const {error: signUpError} = await supabase.auth.signUp({
        display_name,
        email,
        password,
        options: {
            emailRedirectTo: "http://localhost:5173/goback"
        }
      });
      
      if(signUpError) {
        console.error(signUpError)
      } else{
        navigate("/login")
      }
    } else {
      console.log(`User wants to upgrade to ${plan.name}!`);
    }
    // Later you can add: save plan, trigger Stripe, etc.
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
