import { useState } from "react";
import supabase from "../../config/supabaseClient";
import { useNavigate } from "react-router-dom";
import './SignupPage.css'
import { fireConfetti } from "../utils/confetti";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "For curious minds just starting out.",
    features: ["UNLIMITED Tasks/day", "Daily Tracking"],
    highlighted: false,
  },
  {
    name: "Warrior",
    price: "$9/mo",
    description: "For learners who want to compete.",
    features: ["UNLIMITED Tasks/day", "Daily Tracking", "Community", "Coding Battles & Leaderboards"],
    highlighted: true,
    priceId: "price_1Ru2kvJomOLGn4VAckXBfe5s"
  }
  // ,
  // {
  //   name: "Pro",
  //   price: "$19/mo",
  //   description: "Unlock unlimited tasks, community, and courses.",
  //   features: ["UNLIMITED Tasks/day", "Daily Tracking", "Coding Battles & Leaderboards", "Community", "Courses (coming soon)"],
  //   highlighted: true,
  //   priceId: "price_1RZtZYJomOLGn4VAZonkQ56V"
  // }
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [showNotification, setShowNotification] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    display_name: "",
  });
  const [display_name, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const navigate = useNavigate()

  const handleNext = async (e) => {
    e.preventDefault();

    if (!email || !password || !display_name) return;

    const taken = await checkUsernameTaken(display_name.trim());

    if (taken) {
      alert("That username is already taken. Try something else!");
      return;
    }

    setStep(2); // move to pricing step
  };


  const handlePlanClick = async (plan) => {
    if (plan.name === "Starter") {
      const {data, error: signUpError} = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {display_name}
        }
      });
      
      if(signUpError) {
        console.error("Signup error:", signUpError.message);
        return;
      } else{
        if (data.session) {
          fireConfetti()
          setShowNotification(true);
          setTimeout(() => {
            navigate("/newUser");
          }, 2000); // 2 seconds delay
        } else {
          console.error("No session returned — check if email confirmation is still enabled?");
        }
      }
    } else {
      // Call your Stripe endpoint
      try {
        // Testing
        // const res = await fetch("http://localhost:4000/create-checkout-session", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({
        //     email,
        //     display_name,
        //     priceId: plan.priceId,
        //     planName: plan.name
        //    }),
        // });

        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            display_name,
            priceId: plan.priceId,
            planName: plan.name
           }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Stripe checkout error:", text);
          return;
        }

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

  const checkUsernameTaken = async (username) => {
    const { data, error } = await supabase
      .from("user_state")
      .select("user_id")
      .eq("display_name", username)
      .maybeSingle();

    if (error) {
      console.error("Username check error:", error.message);
      return false;
    }

    return !!data; // true if username exists
  };


  return (
    <>
    {showNotification && (
      <div className="notification-card">
        <p>🎉 Sign up completed!</p>
      </div>
    )}
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
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (usernameError) setUsernameError(""); // clear error while typing
                }}
                required
              />
              {usernameError && <p className="input-error">{usernameError}</p>}
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
              <p className="passwordWarning">Minimum 6 Characters & Use a Strong Password!</p>

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
                  {/* <div className="price">{plan.price}</div> */}
                  <div className="price">
                    {plan.name === "Warrior" ? (
                      <>
                        <span className="old-price">$9/mo</span>
                        <span className="new-price">$4.99/mo</span>
                        <span className="beta-tag">Beta Discount!</span>
                      </>
                    ) : (
                      plan.price
                    )}
                  </div>
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
    </>
  );
}
