import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // Import Toaster
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import InputData from './pages/InputData';
import Simulation from './pages/Simulation';
import Profile from './pages/Profile';
import api from './utils/api';
import FloatingAssistant from './components/FloatingAssistant';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      fetchPreferences();
    }
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.preferences?.theme) {
        const newTheme = res.data.preferences.theme === 'dark';
        setDarkMode(prev => {
          if (prev !== newTheme) return newTheme;
          return prev;
        });
      }
    } catch (err) {
      console.error('Error fetching preferences', err);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans">
        <Toaster position="top-right" /> {/* Add Toaster */}
        <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} darkMode={darkMode} toggleTheme={toggleTheme} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/login" element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <Register setAuth={setIsAuthenticated} /> : <Navigate to="/" />} />
            <Route path="/" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/input" element={isAuthenticated ? <InputData /> : <Navigate to="/login" />} />
            <Route path="/simulation" element={isAuthenticated ? <Simulation /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          </Routes>
        </div>
        {isAuthenticated && <FloatingAssistant />}
      </div>
    </Router>
  );
}

export default App;
