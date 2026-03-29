import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '../components/toast/useToast';
import ThemeToggle from '../components/ThemeToggle';
import { normalizeUserRole } from '../constants';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { initTheme } = useThemeStore();
  const toast = useToast();

  useEffect(() => { initTheme(); }, [initTheme]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = normalizeUserRole(userData.role);
        const userObj = {
          uid: userCredential.user.uid,
          name: userData.name,
          role,
        };

        setUser(userObj);

        if (role === 'client') navigate('/client');
        else if (role === 'franchisee') navigate('/franchisee');
        else if (role === 'production') navigate('/production');
      } else {
        setError('ПРОФИЛЬ НЕ НАЙДЕН В БАЗЕ ДАННЫХ');
      }
    } catch (err) {
      console.error(err);
      setError('НЕВЕРНЫЕ ДАННЫЕ ДЛЯ ВХОДА');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    if (!import.meta.env.DEV) return;
    setSeedLoading(true);
    setError('');

    const demoAccounts = [
      { email: 'client@avishu.com', role: 'client', name: 'ДЕМО КЛИЕНТ' },
      { email: 'franchisee@avishu.com', role: 'franchisee', name: 'ДЕМО ФРАНЧАЙЗИ' },
      { email: 'factory@avishu.com', role: 'factory', name: 'ДЕМО ФАБРИКА' }
    ];

    try {
      for (const acc of demoAccounts) {
        let uid = null;
        try {
          const cred = await createUserWithEmailAndPassword(auth, acc.email, '123456');
          uid = cred.user.uid;
        } catch (e) {
          if (e.code === 'auth/email-already-in-use') {
            // Account exists in Auth — sign in to get uid and ensure Firestore doc exists
            try {
              const existingCred = await signInWithEmailAndPassword(auth, acc.email, '123456');
              uid = existingCred.user.uid;
            } catch (signInErr) {
              console.warn(`Cannot sign in as ${acc.email}:`, signInErr.message);
              continue;
            }
          } else {
            throw e;
          }
        }

        if (uid) {
          // Always set/overwrite Firestore user document to ensure correct role
          const userRef = doc(db, 'users', uid);
          await setDoc(userRef, {
            name: acc.name,
            role: acc.role,
            email: acc.email
          });
        }
      }
      toast.success('ТЕСТОВЫЕ АККАУНТЫ ГОТОВЫ! Пароль: 123456');
    } catch (err) {
      console.error(err);
      toast.error('ОШИБКА СОЗДАНИЯ: ' + err.message);
      setError('ОШИБКА СОЗДАНИЯ: ' + err.message);
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-themed text-themed" style={{ transition: 'background-color 0.3s, color 0.3s' }}>
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md animate-fade-up">
        <h1 className="text-4xl lg:text-5xl font-bold mb-12 text-center tracking-tighter animate-fade-in">
          AVISHU СИСТЕМА
        </h1>

        <form onSubmit={handleLogin} className="space-y-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          {error && (
            <div className="p-4 border border-themed bg-themed-secondary text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-themed-tertiary">
              ЛОГИН (Email)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-4 border-b-2 border-themed focus:outline-none text-xl bg-transparent"
              placeholder="operator@avishu.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-widest text-themed-tertiary">
              КОД ДОСТУПА
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 border-b-2 border-themed focus:outline-none text-xl bg-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || seedLoading}
            className="w-full bg-themed-inverse text-themed-inverse p-6 text-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 mt-8 btn-brutal"
          >
            {loading ? 'АВТОРИЗАЦИЯ...' : 'ВОЙТИ'}
          </button>
        </form>

        {import.meta.env.DEV && (
        <div className="mt-8 pt-8 border-t-2 border-dashed border-themed-secondary animate-fade-up" style={{ animationDelay: '0.3s' }}>
           <button
             onClick={handleSeedDatabase}
             disabled={seedLoading}
             className="w-full bg-transparent text-themed-tertiary border-2 border-themed-secondary p-4 font-bold hover:border-themed hover:text-themed transition-all btn-brutal"
           >
             {seedLoading ? 'СОЗДАНИЕ...' : 'СОЗДАТЬ ТЕСТОВЫЕ АККАУНТЫ'}
           </button>
           <p className="text-center text-xs mt-4 text-themed-tertiary font-bold uppercase">
             Только локальная разработка (dev)
           </p>
        </div>
        )}
      </div>
    </div>
  );
}
