import { useState, useEffect, createContext, useContext } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AllGames from './pages/AllGames';
import MyTeam from './pages/MyTeam';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import { verifyToken } from './api';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [page, setPage] = useState('all-games');
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('afl_token');
    if (token) {
      verifyToken()
        .then(() => setIsAdmin(true))
        .catch(() => localStorage.removeItem('afl_token'))
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('afl_token', token);
    setIsAdmin(true);
    setPage('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('afl_token');
    setIsAdmin(false);
    setPage('all-games');
  };

  const navigate = (p) => setPage(p);

  const isAdminPage = page === 'admin' || page === 'admin-login';

  if (!authChecked) {
    return (
      <div className="min-h-dvh bg-afl-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#C0272D', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAdmin, handleLogin, handleLogout }}>
      <div className="flex flex-col min-h-dvh bg-afl-bg text-white">
        <Header onAdminClick={() => navigate(isAdmin ? 'admin' : 'admin-login')} isAdmin={isAdmin} />

        <main className={`flex-1 overflow-auto ${!isAdminPage ? 'pb-20' : ''}`}>
          {page === 'all-games'   && <AllGames />}
          {page === 'my-team'     && <MyTeam />}
          {page === 'admin-login' && (
            <AdminLogin
              onLogin={handleLogin}
              onBack={() => navigate('all-games')}
            />
          )}
          {page === 'admin' && (
            <AdminDashboard
              onLogout={handleLogout}
              onBack={() => navigate('all-games')}
            />
          )}
        </main>

        {!isAdminPage && (
          <BottomNav current={page} onChange={navigate} />
        )}
      </div>
    </AuthContext.Provider>
  );
}
