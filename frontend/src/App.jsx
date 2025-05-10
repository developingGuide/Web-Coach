import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from './pages/Dashboard'
import Test from './pages/test';
import Home from './pages/Home';
import CodingPage from './pages/CodingPage';
import Inbox from './pages/Inbox';

function App() {

  return (
    <div className='App'>
        <BrowserRouter>
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
                </Routes>
            </div>
        </BrowserRouter>
    </div>
  )
}

export default App
