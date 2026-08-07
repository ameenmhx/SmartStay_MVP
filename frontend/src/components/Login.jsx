import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  UserCheck,
  Briefcase,
} from 'lucide-react';

const API_BASE_URL = 'https://smartstay-backend-3wbb.onrender.com';

export default function Login({ targetView, onSuccess, apiBaseUrl = API_BASE_URL }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const viewName =
    targetView === 'manager'
      ? 'Manager Dashboard'
      : targetView === 'waiter'
      ? 'Waiter Dashboard'
      : 'Staff Portal';

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
      // Send login request to Backend POST /login endpoint
      const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Invalid email or password. Please check your credentials.');
      }

      if (data && data.user) {
        setMessage(`Welcome back, ${data.user.name || 'Staff Member'}! Redirecting...`);
        if (onSuccess) {
          onSuccess(data.user);
        }
      } else {
        throw new Error('Unexpected response format from authentication server.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
    setMessage(null);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-brand-card border border-brand-border p-8 sm:p-12 rounded-2xl shadow-stripe relative overflow-hidden">
        {/* Header */}
        <div className="text-center relative z-10">
          <div className="mx-auto w-14 h-14 rounded-xl bg-brand-primary flex items-center justify-center shadow-stripe mb-5">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-body text-xs font-semibold tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span>Staff Portal Authentication</span>
          </div>
          <h2 className="text-2xl sm:text-3xl text-brand-heading font-semibold tracking-tight leading-tight">
            Sign In to Staff Portal
          </h2>
          <p className="mt-3 text-sm text-brand-body max-w-sm mx-auto leading-relaxed">
            Enter your credentials to access the {viewName}.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-700 text-xs sm:text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Success Alert */}
        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-700 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
            <div className="flex-1 font-medium">{message}</div>
          </div>
        )}

        {/* Auth Form */}
        <form className="mt-6 space-y-6 relative z-10" onSubmit={handleAuth}>
          <div className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-body mb-2">
                Staff Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-body">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@smartstay.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-border rounded-xl text-brand-heading placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-body mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-body">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-brand-border rounded-xl text-brand-heading placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-xl text-sm font-semibold text-white bg-brand-primary shadow-stripe hover:shadow-stripe-hover hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Authenticating Staff Member...</span>
              </>
            ) : (
              <>
                <span>Sign In to {viewName}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill Buttons */}
        <div className="pt-6 border-t border-brand-border relative z-10 space-y-3">
          <p className="text-xs font-semibold text-brand-heading text-center">Quick Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              id="demo-login-manager-btn"
              type="button"
              onClick={() => handleDemoFill('manager@smartstay.com', 'manager123')}
              className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Fill Manager</span>
            </button>
            <button
              id="demo-login-waiter-btn"
              type="button"
              onClick={() => handleDemoFill('waiter@smartstay.com', 'waiter123')}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Fill Waiter</span>
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border text-left text-[11px] text-brand-body">
            <span className="font-semibold text-brand-primary">Note:</span> Guest Portal remains 100% public and does not require authentication. Staff login grants role-based access to Waiter and Manager operations.
          </div>
        </div>
      </div>
    </div>
  );
}
