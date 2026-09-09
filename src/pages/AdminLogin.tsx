import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, AlertCircle, Mail, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SEO } from '../components/SEO';

const LOCKOUT_KEY = 'tpa-admin-login-lockout';
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

// A client-side speed bump only — trivially bypassed by clearing
// localStorage, so it is NOT the real security boundary. Supabase Auth
// itself already rate-limits password sign-in attempts server-side
// regardless of anything here; this just discourages casual repeated
// guessing in the UI and gives a clear "try again in Ns" message.
interface LockoutState {
  attempts: number;
  lockedUntil: number | null; // epoch ms
}

function readLockoutState(): LockoutState {
  try {
    const raw = localStorage.getItem(LOCKOUT_KEY);
    if (!raw) return { attempts: 0, lockedUntil: null };
    const parsed = JSON.parse(raw);
    return { attempts: parsed.attempts || 0, lockedUntil: parsed.lockedUntil || null };
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

function writeLockoutState(state: LockoutState) {
  try {
    localStorage.setItem(LOCKOUT_KEY, JSON.stringify(state));
  } catch {
    // ignore — worst case the lockout just doesn't persist across reloads
  }
}

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const state = readLockoutState();
    if (state.lockedUntil && state.lockedUntil > Date.now()) {
      setLockedUntil(state.lockedUntil);
    }
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setSecondsLeft(0);
        writeLockoutState({ attempts: 0, lockedUntil: null });
      } else {
        setSecondsLeft(remaining);
      }
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const registerFailedAttempt = useCallback(() => {
    const state = readLockoutState();
    const attempts = state.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      const until = Date.now() + LOCKOUT_SECONDS * 1000;
      writeLockoutState({ attempts: 0, lockedUntil: until });
      setLockedUntil(until);
    } else {
      writeLockoutState({ attempts, lockedUntil: null });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockedUntil) return;

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (!signInError) {
        writeLockoutState({ attempts: 0, lockedUntil: null });
        navigate('/admin/dashboard');
      } else {
        registerFailedAttempt();
        setError('Incorrect email or password.');
      }
    } catch (err) {
      setError('Ran into an issue, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const isLocked = lockedUntil !== null;

  return (
    <div className="admin-crm min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-950 px-4">
      <SEO
        title="Admin Login - The Property Agent"
        description="Admin login for The Property Agent dashboard"
        type="website"
        noIndex
      />
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-brand-400" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-wide">Admin Access</h1>
          <p className="text-neutral-400 text-sm mt-2">Sign in to manage properties</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-glass p-8">
          {isLocked ? (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 text-sm px-4 py-3 rounded-xl mb-6">
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              <span>Too many attempts. Try again in {secondsLeft}s.</span>
            </div>
          ) : error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@thepropertyagent.in"
                className="w-full px-4 py-3 pl-10 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
                autoComplete="email"
                required
                disabled={isLocked}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pl-10 pr-12 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm"
                autoComplete="current-password"
                required
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password || isLocked}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-navy-900 font-semibold py-3 rounded-xl transition-all hover:shadow-lg hover:shadow-brand-500/25"
          >
            {isLocked ? `Locked (${secondsLeft}s)` : loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
