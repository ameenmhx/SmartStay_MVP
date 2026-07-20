import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Building2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function Login({ targetView, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState(null);

  const viewName = targetView === 'manager' ? 'Manager Dashboard' : 'Waiter Dashboard';

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) throw signUpError;

        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists. Please sign in instead.');
        } else {
          setMessage('Account created! If email confirmation is enabled, check your inbox. Otherwise, you can log in now.');
          setIsSignUp(false);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data?.session && onSuccess) {
          onSuccess(data.session);
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden bg-slate-900/90 backdrop-blur-xl">
        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center relative z-10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20 mb-4 transform hover:scale-105 transition-transform duration-300">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Portal Security</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isSignUp ? 'Create Staff Account' : `Access ${viewName}`}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            {isSignUp
              ? 'Register new staff credentials to manage hotel operations.'
              : `Sign in with your verified credentials to access the ${viewName.toLowerCase()}.`}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start space-x-3 text-red-400 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start space-x-3 text-emerald-400 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">{message}</div>
          </div>
        )}

        {/* Auth Form */}
        <form className="mt-8 space-y-5 relative z-10" onSubmit={handleAuth}>
          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@smartstay.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 border border-indigo-400/30 flex items-center justify-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : `Sign In to ${viewName}`}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Toggle between Sign In & Sign Up */}
        <div className="pt-4 border-t border-slate-800/80 text-center relative z-10 flex flex-col space-y-3">
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Already have a staff account?' : "Don't have an account yet?"}{' '}
            <button
              id="toggle-auth-mode-btn"
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Sign Up for Staff Access'}
            </button>
          </p>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 text-left text-[11px] text-slate-400">
            <span className="font-semibold text-indigo-400">Note:</span> Guest Portal remains 100% public and does not require authentication. Staff authentication protects Waiter and Manager operations.
          </div>
        </div>
      </div>
    </div>
  );
}
