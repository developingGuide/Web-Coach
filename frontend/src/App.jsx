import {Routes, Route, useLocation} from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import Dashboard from './pages/Dashboard'
import Test from './pages/test';
import Home from './pages/Home';
import CodingPage from './pages/CodingPage';
import Inbox from './pages/Inbox';
import Journey from './pages/Journey';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ChallengeMap from './pages/Challenge';
import supabase from '../config/supabaseClient';
import { getLevelFromExp, getExpForLevel } from "./utils/expCalculator";
import './App.css'
import TestingIdea from './pages/TestingIdea';
import JourneyCharacterMap from './pages/TestingIdea';
import QueuePage from './pages/QueuePage';
import BattlePage from './pages/BattlePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import { AuthContext } from './components/AuthContext';
import GoBack from './pages/GoBack';
import SuccessPage from './pages/SuccessPage';
import OnboardingPage from './pages/Onboarding';
import ChatPage from './pages/ChatPage';
import ProfileSettings from './pages/ProfileSettings';
import Leaderboard from './pages/Leaderboard';

function App() {
    const {user} = useContext(AuthContext)
    const location = useLocation();
    const fullScreenRoutes = ["/playground", "/", "/journey", "/signup", "/login", "/goback", "/success", "/battle", "/chat", "/newUser", "/leaderboard", "/dashboard"];
    const isFullScreen = fullScreenRoutes.includes(location.pathname);
    
    
    const [userExp, setUserExp] = useState(0);
    const [userLevel, setUserLevel] = useState(0);
    const [nextLevelExp, setNextLevelExp] = useState(100);
    const [currentLevelExp, setCurrentLevelExp] = useState(0);
    const [avatar, setAvatar] = useState('');
    
    useEffect(() => {
        if (!user) {
            return; // or show a spinner, or redirect to login
        }

        const userId = user.id

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

        const fetchAvatar = async () => {
            const { data: userAvatar, error: avatarError } = await supabase
            .from("user_state")
            .select("avatar_url")
            .eq("user_id", userId)
            .maybeSingle();

            if (avatarError) {
                console.error(avatarError)
            }

            setAvatar(userAvatar?.avatar_url || "/noobie.png");
        }

        fetchExp();
        fetchAvatar();



        const interval = setInterval(fetchExp, 5000); // re-check every 5 seconds
        return () => clearInterval(interval);
    }, [user]);



    return (
        <div className='App'>
            {!isFullScreen && (
                <Navbar
                    exp={currentLevelExp}
                    level={userLevel}
                    maxExp={nextLevelExp}
                    avatar={avatar}
                />
            )}
                <div className='pages'>
                    <div className="space-background">
                        <Routes>
                            <Route
                                path='/signup'
                                element={<SignupPage/>}
                            />
                            <Route 
                                path="/success"
                                element={<SuccessPage/>}
                            />
                            <Route
                                path='/newUser'
                                element={<OnboardingPage/>}
                            />
                            <Route
                                path='/login'
                                element={<LoginPage/>}
                            />
                            <Route
                                path="/goback"
                                element={<GoBack/>}
                            />
                            <Route
                                path="/"
                                element={<Home/>}
                            />
                            <Route 
                                path="/profile"
                                element={<ProfileSettings/>}
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
                                path="/challenges"
                                element={<ChallengeMap/>}
                            />
                            <Route
                                path='/queue'
                                element={<QueuePage/>}
                            />
                            <Route
                                path='/battle/:match_id'
                                element={<BattlePage/>}
                            />
                            <Route
                                path="/testing"
                                element={<AuthContext/>}
                            />
                            <Route
                                path="/journey"
                                element={<Journey/>}
                            />
                            <Route
                                path="/chat"
                                element={<ChatPage/>}
                            />
                            <Route
                                path='/leaderboard'
                                element={<Leaderboard/>}
                            />
                        </Routes>
                    </div>
                </div>
        </div>
    )
}

export default App
