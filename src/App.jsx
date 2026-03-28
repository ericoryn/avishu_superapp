import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/useAuthStore';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ClientHome from './pages/client/Home';
import FranchiseeDashboard from './pages/franchisee/Dashboard';
import ProductionQueue from './pages/production/Queue';
import { KNOWN_ROLE_SLUGS, normalizeUserRole } from './constants';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const { user, setUser, isLoading, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const rawRole = userDoc.data().role;
            setUser({
              uid: firebaseUser.uid,
              name: userDoc.data().name,
              role: normalizeUserRole(rawRole),
            });
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-2xl uppercase bg-themed text-themed animate-fade-in" style={{ transition: 'background-color 0.3s' }}>ЗАГРУЗКА СИСТЕМЫ...</div>;
  }

  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            user
              ? KNOWN_ROLE_SLUGS.includes(user.role)
                ? <Navigate to={`/${user.role}`} replace />
                : <Login />
              : <Login />
          }
        />
        <Route path="/franchise" element={<Navigate to="/franchisee" replace />} />

        <Route path="/client" element={
          <ProtectedRoute allowedRole="client">
            <ClientHome />
          </ProtectedRoute>
        } />

        <Route path="/franchisee" element={
          <ProtectedRoute allowedRole="franchisee">
            <FranchiseeDashboard />
          </ProtectedRoute>
        } />

        <Route path="/production" element={
          <ProtectedRoute allowedRole="production">
            <ProductionQueue />
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
