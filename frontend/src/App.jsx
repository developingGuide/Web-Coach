import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from './pages/Dashboard'
import Test from './pages/test';
import Home from './pages/Home';
import CodingPage from './pages/CodingPage';
import Inbox from './pages/Inbox';
import Journey from './pages/Journey';
import Navbar from './components/NavBar';
import Sidebar from './components/Sidebar';
import './App.css'

function App() {

  return (
    <div className='App'>
        <Navbar/>
        <BrowserRouter>
            <Sidebar/>
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
        </BrowserRouter>
    </div>
  )
}

export default App
