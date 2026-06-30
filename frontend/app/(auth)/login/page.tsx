'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth2 initiation endpoint for production
    window.location.href = process.env.NEXT_PUBLIC_API_URL 
      ? `${process.env.NEXT_PUBLIC_API_URL}/oauth2/authorization/google`
      : 'http://localhost:8080/oauth2/authorization/google';
  };

  const handleSandboxLogin = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await axios.post(`${apiUrl}/api/auth/mock-login`);
      if (res.data && res.data.token) {
        localStorage.setItem('gmb_auth_token', res.data.token);
        document.cookie = `gmb_auth_token=${res.data.token}; path=/; max-age=86400; SameSite=Lax`;
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Sandbox login failed:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-white selection:bg-violet-500 selection:text-white">
      {/* Left Column - Marketing Visuals */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-r border-slate-800/50 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-violet-600/20 border border-violet-500/30 rounded-xl">
            <Sparkles className="h-6 w-6 text-violet-400" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            GMB AI Manager
          </span>
        </div>

        {/* Feature Highlights */}
        <div className="my-auto space-y-8 max-w-lg relative z-10">
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
            Supercharge Your Local Search Authority
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage your Google Business Profiles, respond to reviews with Claude-powered AI, schedule local updates, and track competitors in one premium dashboard.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="mt-1 p-0.5 bg-violet-500/20 rounded-full text-violet-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">AI Review Auto-Responses</h4>
                <p className="text-sm text-slate-400">Generate review responses tailored for hospitality, healthcare, or retail in seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-1 p-0.5 bg-violet-500/20 rounded-full text-violet-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">GMB Post Campaign Scheduler</h4>
                <p className="text-sm text-slate-400">Draft weekly updates, promotions, and holiday greeting posts that keep customers engaged.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-1 p-0.5 bg-violet-500/20 rounded-full text-violet-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Local SEO Competitor Tracker</h4>
                <p className="text-sm text-slate-400">Track competitor rankings, categories, and review velocity to spot market opportunities.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-sm text-slate-500 relative z-10">
          © 2026 GMB AI Manager. All rights reserved. Built for modern local brands.
        </div>
      </div>

      {/* Right Column - Authentication Card */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="p-2 bg-violet-600/20 border border-violet-500/30 rounded-xl">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <span className="font-bold text-lg">GMB AI Manager</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Get Started
            </h2>
            <p className="text-slate-400 text-sm">
              Sign in to manage and grow your GMB presence.
            </p>
          </div>

          <div className="space-y-4">
            {/* Sandbox Enter Button */}
            <button
              onClick={handleSandboxLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/30 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Enter Sandbox Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

            <div className="relative my-6 flex items-center justify-center">
              <span className="absolute px-3 bg-slate-950 text-xs font-semibold text-slate-600 uppercase tracking-widest">
                Or Production Mode
              </span>
              <div className="w-full border-t border-slate-800" />
            </div>

            {/* Google OAuth Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3.5 px-4 py-3 bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 font-semibold rounded-xl transition-all duration-200"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.13-5.136 4.13-3.224 0-5.837-2.613-5.837-5.837s2.613-5.837 5.837-5.837c1.397 0 2.673.493 3.677 1.31l3.07-3.07C18.8 3.105 15.72 2 12.24 2 6.584 2 2 6.584 2 12.24s4.584 10.24 10.24 10.24c5.795 0 10.24-4.11 10.24-10.24 0-.648-.065-1.282-.182-1.955H12.24z"
                />
              </svg>
              Continue with Google OAuth
            </button>

            <p className="text-[10px] text-center text-slate-500 leading-relaxed max-w-xs mx-auto pt-4 border-t border-slate-800/40">
              * The Sandbox bypass logs you in with a pre-seeded Italian Restaurant group profile and reviews list instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
