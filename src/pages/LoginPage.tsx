import React, { useState } from 'react';
import { Sparkles, Lock, Mail, Eye, EyeOff, AlertCircle, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginPageProps {
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToRegister }) => {
  const { login, quickDemoLogin, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setIsLoggingIn(true);
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      setIsLoggingIn(true);
      await quickDemoLogin();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Brand Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-200">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
            Welcome to TaskFlow
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            MERN Stack Task Management System with Real-Time Analytics
          </p>
        </div>

        {/* 1-Click Demo Fill Action */}
        <div className="mb-4 rounded-xl border border-violet-200 bg-violet-50/70 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-violet-800 uppercase tracking-wider block">
                Portfolio Demo Account
              </span>
              <p className="text-xs text-violet-700 font-mono truncate">
                alex@taskflow.dev · password123
              </p>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoggingIn || isLoading}
              className="shrink-0 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 transition-colors disabled:opacity-50"
            >
              1-Click Demo
            </button>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-10 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn || isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-violet-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <span>{isLoggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Switch to Registration */}
          <div className="mt-6 pt-5 text-center border-t border-slate-100 text-xs text-slate-500">
            Don&apos;t have an account yet?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-semibold text-violet-600 hover:text-violet-700 hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-8 flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-500" /> JWT Protected
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-500" /> bcrypt Encrypted
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-500" /> MongoDB Powered
          </span>
        </div>
      </div>
    </div>
  );
};
