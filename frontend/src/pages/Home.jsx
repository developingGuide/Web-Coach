import './Home.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';

const Home = () => {
    const journeySteps = [
        {
            icon: "🌿 Checkpoint 1",
            title: "Start in HTML Hut",
            desc: "Begin with real HTML tasks — forms, layouts, and structure challenges.",
        },
        {
            icon: "🌊 Checkpoint 2",
            title: "Sail through CSS Cove",
            desc: "Learn responsive design, animations, and visual polish.",
        },
        {
            icon: "🧩 Checkpoint 3",
            title: "Conquer JS Jungle",
            desc: "Tackle interactivity, DOM logic, and JavaScript puzzles.",
        },
        {
            icon: "🧪 Checkpoint 4",
            title: "Ship Real Projects",
            desc: "Apply your skills in mini real-world apps and client requests.",
        },
        {
            icon: "🚀 Checkpoint 5",
            title: "Unlock New Worlds",
            desc: "Access new zones, unlock quests, and earn XP as you build.",
        },
    ];

    const sliderSettings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        responsive: [
            {
            breakpoint: 768, // mobile
            settings: {
                slidesToShow: 1,
            },
            },
        ],
    };


    const plans = [
        {
            name: "Starter",
            price: "$0",
            description: "Great for curious beginners trying things out.",
            features: [
            "UNLIMITED Tasks/day",
            "Daily Tracking",
            ],
            highlighted: false,
        },
        {
            name: "Warrior",
            price: "$9/mo",
            description: "For learners who want to compete.",
            features: [
            "UNLIMITED Tasks/day",
            "Daily Tracking",
            "Community",
            "Coding Battles & Leaderboards",
            ],
            highlighted: true,
        }
        // ,
        // {
        //     name: "Pro",
        //     price: "$19/mo",
        //     description: "Unlock full access to projects, community & courses.",
        //     features: [
        //     "UNLIMTED Tasks/day",
        //     "Daily Tracking",
        //     "Coding Battles & Leaderboards",
        //     "Community",
        //     "Courses (Coming Soon)"
        //     ],
        //     highlighted: false,
        // },
    ];



    const FAQItem = ({ question, answer }) => {
        const [open, setOpen] = useState(false);

        return (
            <div className="faq-item">
            <button className="faq-question" onClick={() => setOpen(!open)}>
                {question}
                <span className={`faq-toggle ${open ? "open" : ""}`}>⌄</span>
            </button>
            <div className={`faq-answer ${open ? "visible" : ""}`}>
                <p>{answer}</p>
            </div>
            </div>
        );
    };

    const faqs = [
        {
        q: "What makes this different than other coding learning apps?",
        a: "Most apps teach you concepts. This one trains you to ship. You're not just learning syntax — you're practicing like a real frontend dev, solving client-style tasks, building weird projects, and staying consistent through habit systems and fun battles.",
        },
        {
        q: "Do I need to know HTML/CSS/JavaScript first?",
        a: "You should know the basics, but you don’t need to be an expert. This app is designed for beginners who want to apply what they’ve learned and escape endless tutorials.",
        },
        {
        q: "Is this free to use?",
        a: "There’s a free Starter plan to help you begin. If you want to unlock full journeys, battles, and advanced tracking, you can upgrade anytime.",
        },
        {
        q: "Will I get feedback on my code?",
        a: "Yep. You'll get real-time feedback on some tasks and progress if you're on Warrior tier.",
        },
    ];

    const navigate = useNavigate()

    const {user, loading} = useContext(AuthContext)

    useEffect(() => {
        if (!loading && user) {
        navigate('/dashboard'); // auto-redirect to dashboard
        }
    }, [loading, user]);

    if (loading) return <div>Loading...</div>;

    return (
        <>
        <img src="/space.png" alt="space" className="homePageImg" />
        <div className="darkFilter"></div>
        <div className="homePage">
            <button className='logInBtn' onClick={() => {navigate('/login')}}>Log In</button>
            <div className="content">
                <div className="hero">
                    <div className="textAndButton">
                        <h1 className='anim-typewriter'>DEVSIM</h1>
                        <h3>Learn Web Development with "Weird" Projects, Habit Tracking, and a Community that makes it all FUN!</h3>
                        <button className='ctaButton' onClick={() => {navigate('/signup')}}>Start Now!</button>
                    </div>
                </div>

                <div className="tools-section">
                    <h2 className="section-title">🧰 Your Tools</h2>
                    <p className="section-subtitle">Equip yourself with everything you need to practice, grow, and win.</p>
                    
                    <div className="tools-grid">
                        {[
                        {
                            icon: "🧪",
                            title: "Live Coding Playground",
                            desc: "Practice inside your browser — no setup needed.",
                        },
                        {
                            icon: "🔧",
                            title: "Simulated Client Quests",
                            desc: "Tackle realistic frontend requests that mimic real work.",
                        },
                        {
                            icon: "🧱",
                            title: "Guided Projects",
                            desc: "Break down large projects into small, trackable wins.",
                        },
                        {
                            icon: "📆",
                            title: "Habit Tracker",
                            desc: "Stay consistent with a visual streak system.",
                        },
                        {
                            icon: "🎮",
                            title: "XP & Leveling",
                            desc: "Earn XP from quests and unlock milestones.",
                        },
                        {
                            icon: "👥",
                            title: "1v1 & Group Battles",
                            desc: "Compete with others in real-time coding challenges and seasonal tournaments.",
                        },
                        ].map((tool, i) => (
                        <div key={i} className="tool-card">
                            <div className="tool-icon">{tool.icon}</div>
                            <div className="tool-title">{tool.title}</div>
                            <div className="tool-desc">{tool.desc}</div>
                        </div>
                        ))}
                    </div>
                </div>


                <div className="journey-section">
                    <h2 className="section-title">🌱 Your Journey</h2>
                    <p className="section-subtitle">
                        Level up from HTML noob to frontend hero — one real challenge at a time.
                    </p>

                    <div className="journey-slider">
                        <Slider {...sliderSettings}>
                        {journeySteps.map((step, i) => (
                            <div key={i} className="journey-slide">
                            <div className="journey-card">
                                <div className="journey-icon">{step.icon}</div>
                                <div className="journey-title">{step.title}</div>
                                <div className="journey-desc">{step.desc}</div>
                            </div>
                            </div>
                        ))}
                        </Slider>
                    </div>
                </div>


                <div className="pricing-section">
                    <h2 className="section-title">Choose Your Path</h2>
                    <p className="section-subtitle">Level up at your pace. Start free, upgrade anytime.</p>

                    <div className="pricing-cards">
                        {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`pricing-card ${plan.highlighted ? "highlighted" : ""}`}
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

                            <button className="get-started-btn" onClick={() => {navigate('/signup')}}>Get Started</button>

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


                <div className="faq-section">
                    <h2 className="section-title">FAQs</h2>
                    <p className="section-subtitle">Still got questions? We've got answers.</p>
                    <div className="faq-list">
                        {faqs.map((item, i) => (
                            <FAQItem key={i} question={item.q} answer={item.a} />
                        ))}
                    </div>
                </div>


                <section className="cta-section" style={{ textAlign: 'center', padding: '4rem 2rem', color: '#fff' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Ready to Escape Tutorial Hell?</h2>
                    <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Build real projects. Build real momentum. Build your dev confidence.</p>
                    <button onClick={() => {navigate('/signup')}} className='get-started-btn'>
                        Get Started for Free
                    </button>
                </section>
                
                <footer style={{color: '#ccc', padding: '3rem 2rem', fontSize: '0.9rem' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                        <div style={{ flex: '1 1 200px', marginBottom: '1.5rem' }}>
                        <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>DevSim</h4>
                        <p>Helping beginners practice consistently and build fun projects with joy.</p>
                        </div>
                        <div style={{ flex: '1 1 150px', marginBottom: '1.5rem' }}>
                        <h5 style={{ color: '#fff', marginBottom: '0.5rem' }}>Quick Links</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><a href="/pricing" style={{ color: '#ccc', textDecoration: 'none' }}>Pricing</a></li>
                            <li><a href="/faq" style={{ color: '#ccc', textDecoration: 'none' }}>FAQ</a></li>
                        </ul>
                        </div>
                        <div style={{ flex: '1 1 150px', marginBottom: '1.5rem' }}>
                        <h5 style={{ color: '#fff', marginBottom: '0.5rem' }}>Community</h5>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><a href="https://discord.gg/WnwMehNU" target="_blank" style={{ color: '#ccc', textDecoration: 'none' }}>Join Discord</a></li>
                            <li><a href="https://youtube.com/@developingguide" target="_blank" style={{ color: '#ccc', textDecoration: 'none' }}>YouTube Channel</a></li>
                        </ul>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid #222', paddingTop: '1rem' }}>
                        © {new Date().getFullYear()} DevSim. All rights reserved.
                    </div>
                </footer>

            </div>
        </div>
        </>
    );
};


export default Home;