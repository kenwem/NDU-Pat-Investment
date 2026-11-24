import { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { isAdmin } from './constants/siteConfig';

import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Products from './pages/Products';
import Testimonials from './pages/Testimonials';
import Contact from './pages/Contact';
import Sitemap from './pages/Sitemap';

import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Appointments from './pages/admin/Appointments';
import AdminProducts from './pages/admin/AdminProducts';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminServices from './pages/admin/AdminServices';
import CommentModeration from './pages/admin/CommentModeration';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMessages from './pages/admin/AdminMessages';
import Orders from './pages/admin/Orders';

const ADMIN_IDLE_LIMIT_MS = 1800000; // 30 minutes
const ACTIVITY_KEY = 'admin_last_activity';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Global Admin Idle Tracker across the entire site
  useEffect(() => {
    if (!user || !isAdmin(user.email)) return;

    const existing = localStorage.getItem(ACTIVITY_KEY);
    if (!existing) {
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    }

    const updateActivity = () => {
      if (document.visibilityState === 'hidden') return;
      localStorage.setItem(ACTIVITY_KEY, Date.now().toString());
    };

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'keydown',
      'visibilitychange',
    ];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    const interval = setInterval(async () => {
      const lastStr = localStorage.getItem(ACTIVITY_KEY);
      if (!lastStr) return;
      const elapsed = Date.now() - parseInt(lastStr, 10);
      if (elapsed >= ADMIN_IDLE_LIMIT_MS) {
        localStorage.removeItem(ACTIVITY_KEY);
        await signOut(auth);
      }
    }, 15000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(interval);
    };
  }, [user]);

  const ProtectedAdmin = () => {
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100">
          <div className="w-10 h-10 border-4 border-lime-200 border-t-lime-600 rounded-full animate-spin" />
        </div>
      );
    }
    if (!user || !isAdmin(user.email)) {
      return <Navigate to="/admin/login" replace />;
    }
    return <AdminLayout />;
  };

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sitemap" element={<Sitemap />} />
        </Route>

        {/* Admin Auth Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedAdmin />}>
          <Route index element={<Dashboard />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="comments" element={<CommentModeration />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
