import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2, Mail } from 'lucide-react';
import { auth } from '../../firebase';
import { isAdmin, BRAND_INFO } from '../../constants/siteConfig';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && isAdmin(user.email)) {
        localStorage.setItem('admin_last_activity', Date.now().toString());
        navigate('/admin', { replace: true });
      }
    });
    return () => unsub();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      if (!isAdmin(cred.user.email)) {
        await signOut(auth);
        setError(
          `Access denied for ${cred.user.email}. Please sign in with an authorized administrator email.`
        );
        return;
      }
      localStorage.setItem('admin_last_activity', Date.now().toString());
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('unauthorized-domain')) {
        setError(
          'This domain is not yet authorized in Firebase Auth. Please add this URL in Firebase Console > Authentication > Settings > Authorized domains.'
        );
      } else {
        setError(msg || 'Google sign-in failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!isAdmin(cred.user.email)) {
        await signOut(auth);
        setError(
          `Access denied for ${cred.user.email}. Please sign in with an authorized administrator email.`
        );
        return;
      }
      localStorage.setItem('admin_last_activity', Date.now().toString());
      navigate('/admin', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('operation-not-allowed')) {
        setError(
          'Email/Password sign-in is not enabled in Firebase Console yet. Use "Sign in with Google" above or enable Email/Password in Firebase Authentication.'
        );
      } else {
        setError(msg || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <Helmet>
        <title>Admin Login | {BRAND_INFO.name}</title>
      </Helmet>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200">
        {/* Dark Stone-900 Card Header */}
        <div className="bg-stone-900 text-white px-8 py-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-lime-500/20 text-lime-400 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="text-xs text-lime-400 font-semibold uppercase tracking-widest">
            {BRAND_INFO.name}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium px-4 py-3 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          {forgotMode ? (
            resetSent ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
                <h2 className="text-lg font-bold text-stone-900">Reset Link Sent</h2>
                <p className="text-sm text-stone-600">
                  Check <strong>{email}</strong> for password reset instructions.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setResetSent(false);
                  }}
                  className="text-sm font-bold text-lime-600 hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kennywemson1@gmail.com"
                      className="w-full rounded-xl border border-stone-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lime-600 hover:bg-lime-700 text-white font-bold py-3 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(false);
                    setError('');
                  }}
                  className="w-full text-xs font-semibold text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Cancel and return to login
                </button>
              </form>
            )
          ) : (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google (Admin)
              </button>

              <div className="relative flex items-center">
                <div className="flex-grow border-t border-stone-200" />
                <span className="flex-shrink mx-3 text-[11px] font-bold uppercase text-stone-400">
                  Or email & password
                </span>
                <div className="flex-grow border-t border-stone-200" />
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kennywemson1@gmail.com"
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setError('');
                      }}
                      className="text-xs font-semibold text-lime-600 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-stone-200 px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="Toggle password visibility"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-lime-600 hover:bg-lime-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm transition-colors cursor-pointer"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
            </>
          )}

          <div className="pt-2 text-center border-t border-stone-100">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to NDU PAT Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
