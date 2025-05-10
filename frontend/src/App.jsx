import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from './pages/Dashboard'
import CodeEditor from './components/CodeEditor';
import Home from './pages/Home';
import CodingPage from './pages/CodingPage';

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
                        element={<CodeEditor/>}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    </div>
  )
}

export default App
