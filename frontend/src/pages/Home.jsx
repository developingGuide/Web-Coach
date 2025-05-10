import './Home.css';

const Home = () => {


    return (
        <div className='homeLayout'>
            <header className="header">
                <h1>Web Dev Coach</h1>
                <nav>
                    <a href="#">Login</a>
                </nav>
            </header>
    
            <section className="hero">
                <h2>Practice Web Dev Like It's the Real Thing</h2>
                <p>Simulated client requests. Real projects. Daily progress. No more tutorials — just building.</p>
                <button onClick={() => alert('Redirect to journey or signup')}>Start Building</button>
            </section>
    
            <section className="features">
                <div className="feature">
                    <h3>🎮 Client Simulator</h3>
                    <p>Get real-feeling client briefs — from portfolio sites to dashboards. No filler.</p>
                </div>
                <div className="feature">
                    <h3>👍 Live Coach Feedback</h3>
                    <p>Build in the playground, get hints and validation instantly.</p>
                </div>
                <div className="feature">
                    <h3>🔥 Daily Shipping Tracker</h3>
                    <p>Ship something small every day. Stay consistent and get visual feedback.</p>
                </div>
            </section>
    
            <footer className="footer">
                &copy; 2025 Web Dev Coach — Helping You Build for Real
            </footer>
        </div>
    );
};


export default Home;