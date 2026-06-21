import { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Login from './pages/Login';
import Register from './pages/Register';
import * as api from './services/api';

export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('rit_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.getCurrentUser()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem('rit_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleLogin = (tokenValue, userData) => {
    localStorage.setItem('rit_token', tokenValue);
    setToken(tokenValue);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('rit_token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, token, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
