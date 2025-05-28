import {Routes, Route, useLocation} from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard'
import Test from './pages/test';
import Home from './pages/Home';
import CodingPage from './pages/CodingPage';
import Inbox from './pages/Inbox';
import Journey from './pages/Journey';
import Navbar from './components/NavBar';
import Sidebar from './components/Sidebar';
import supabase from '../config/supabaseClient';
import { getLevelFromExp, getExpForLevel } from "./utils/expCalculator";
import './App.css'

function App() {
    const userId = "demo_user"
    const location = useLocation();
    const fullScreenRoutes = ["/playground", "/", "/journey"];
    const isFullScreen = fullScreenRoutes.includes(location.pathname);


    const [userExp, setUserExp] = useState(0);
    const [userLevel, setUserLevel] = useState(0);
    const [nextLevelExp, setNextLevelExp] = useState(100);
    const [currentLevelExp, setCurrentLevelExp] = useState(0);

    useEffect(() => {
        const fetchExp = async () => {
            const { data, error } = await supabase
            .from("user_state")
            .select("exp")
            .eq("user_id", userId)
            .single();

            if (data) {
                const exp = data.exp;
                const level = getLevelFromExp(exp);
                const baseExp = getExpForLevel(level);
                const nextExp = getExpForLevel(level + 1);

                setUserExp(exp);
                setUserLevel(level);
                setCurrentLevelExp(exp - baseExp);
                setNextLevelExp(nextExp - baseExp);
            }
        };

        fetchExp();



        const interval = setInterval(fetchExp, 5000); // re-check every 5 seconds
        return () => clearInterval(interval);
        }, []);



    return (
        <div className='App'>
            {!isFullScreen && (
                <Navbar
                    exp={currentLevelExp}
                    level={userLevel}
                    maxExp={nextLevelExp}
                />
            )}
            {!isFullScreen && <Sidebar />}
                <div className='pages'>
                    <Routes>
                        <Route
                            path="/"
                            element={<Home/>}
                        />
                        <Route
                            path="/dashboard"
                            element={<Dashboard/>}
                        />
                        <Route
                            path="/playground"
                            element={<CodingPage/>}
                        />
                        <Route
                            path="/test"
                            element={<Test/>}
                        />
                        <Route
                            path="/inbox"
                            element={<Inbox/>}
                        />
                        <Route
                            path="/journey"
                            element={<Journey/>}
                        />
                    </Routes>
                </div>
        </div>
    )
}

export default App
