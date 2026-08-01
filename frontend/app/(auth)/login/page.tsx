'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import axios from 'axios';


function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const reasonParam = searchParams.get('reason');

  const [loading, setLoading] = useState(false);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (errorParam) {
      if (errorParam === 'true') {
        setErrorMessage('Authentication failed. Please try again.');
      } else if (errorParam === 'token_save_failed') {
        setErrorMessage('Failed to save login token. Please enable cookies and localStorage.');
      } else if (errorParam === 'no_token') {
        setErrorMessage('No authentication token was received from the server.');
      } else {
        setErrorMessage(`Login error: ${errorParam}`);
      }
    } else if (reasonParam) {
      if (reasonParam === 'auth_failed') {
        setErrorMessage('Your session has expired or is invalid. Please sign in again.');
      } else if (reasonParam === 'no_token') {
        setErrorMessage('Please sign in to access the dashboard.');
      } else if (reasonParam === 'session_expired') {
        setErrorMessage('Your session has expired. Please sign in again.');
      } else {
        setErrorMessage(`Authentication required: ${reasonParam}`);
      }
    }
  }, [errorParam, reasonParam]);

  const handleGoogleLogin = () => {
    if (!acceptedTerms) {
      setErrorMessage('You must accept the Terms of Service & Privacy Policy to continue.');
      return;
    }
    try {
      setLoading(true);
      // Direct browser navigation to backend OAuth2 endpoint.
      // This avoids the cross-domain session cookie issue that occurs when using
      // an AJAX proxy: the backend's Set-Cookie (for OAuth2 state) is swallowed
      // by the Next.js proxy and never reaches the browser, causing state mismatch
      // (400 error) when Google redirects back.
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      window.location.href = `${apiUrl}/oauth2/authorization/google`;
    } catch (e: any) {
      console.error('Failed to initiate Google auth:', e);
      setErrorMessage('Failed to connect to Google authentication service.');
      setLoading(false);
    }
  };

  const handleSandboxLogin = async () => {
    if (!acceptedTerms) {
      setErrorMessage('You must accept the Terms of Service & Privacy Policy to continue.');
      return;
    }
    try {
      setSandboxLoading(true);
      const apiUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');
      const res = await axios.post(`${apiUrl}/api/auth/mock-login`);
      if (res.data && res.data.token) {
        localStorage.setItem('gmb_auth_token', res.data.token);
        document.cookie = `gmb_auth_token=${res.data.token}; path=/; max-age=86400; SameSite=Lax`;
        router.replace('/dashboard');
      } else {
        setSandboxLoading(false);
      }
    } catch (err) {
      console.error('Sandbox login failed:', err);
      setSandboxLoading(false);
    }
  };

  // Avoid hydration mismatch by showing minimal content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-950 text-white selection:bg-violet-500 selection:text-white">
      {/* Left Column - Marketing Visuals */}
      <div className="hidden lg:flex lg:col-span-7 relative flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border-r border-slate-800/50 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 gradient-bg rounded-xl shadow-lg shadow-primary/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
              <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/>
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            BizLocalPilot AI
          </span>
        </div>

        {/* Feature Highlights */}
        <div className="my-auto space-y-8 max-w-lg relative z-10">
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight">
            Supercharge Your Local Search Authority
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Manage your Google Business Profiles, respond to reviews with Gemini-powered AI, schedule local updates, and track competitors in one premium dashboard.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="mt-1 p-1.5 bg-violet-500/20 rounded-xl text-violet-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">AI Review Auto-Responses</h4>
                <p className="text-sm text-slate-400">Generate review responses tailored for hospitality, healthcare, or retail in seconds.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-1 p-1.5 bg-violet-500/20 rounded-xl text-violet-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">GMB Post Campaign Scheduler</h4>
                <p className="text-sm text-slate-400">Draft weekly updates, promotions, and holiday greeting posts that keep customers engaged.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="mt-1 p-1.5 bg-violet-500/20 rounded-xl text-violet-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
                  <polyline points="16 7 22 7 22 13"/>
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">Local SEO Competitor Tracker</h4>
                <p className="text-sm text-slate-400">Track competitor rankings, categories, and review velocity to spot market opportunities.</p>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span className="text-xs text-slate-300 font-medium">DPDP Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 rounded-full border border-slate-700/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <span className="text-xs text-slate-300 font-medium">Google Verified</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-sm text-slate-500 relative z-10">
          © 2026 BizLocalPilot AI. All rights reserved. Built for modern local brands.
        </div>
      </div>

      {/* Right Column - Authentication Card */}
      <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <div className="p-2 gradient-bg rounded-xl shadow-lg shadow-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                  <path d="M9 12a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2z"/>
                </svg>
              </div>
              <span className="font-bold text-lg text-white">BizLocalPilot AI</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-sm">
              Sign in with your Google account to manage and grow your GMB presence.
            </p>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Terms Consent Checkbox */}
            <div className="flex items-start gap-3 p-3 bg-slate-900/40 border border-slate-800/60 rounded-xl">
              <input
                id="terms-checkbox"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked);
                  if (e.target.checked) setErrorMessage('');
                }}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-950 cursor-pointer"
              />
              <label htmlFor="terms-checkbox" className="text-xs text-slate-400 select-none cursor-pointer leading-relaxed">
                I accept the{' '}
                <button type="button" onClick={() => setShowTermsModal(true)} className="text-violet-400 hover:underline font-bold">
                  Terms of Service
                </button>{' '}
                and{' '}
                <a href="/privacy" className="text-violet-400 hover:underline font-bold">Privacy Policy</a>.
                I consent to BizLocalPilot processing my GMB profile info.
              </label>
            </div>

            {/* Primary Google OAuth Login Button */}
            <button
              id="google-login-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3.5 px-4 py-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] ${
                !acceptedTerms ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                    <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
                  </svg>
                  Continue with Google
                  <ArrowRight className="h-4 w-4 ml-auto" />
                </>
              )}
            </button>



            <div className="relative flex items-center justify-center my-2">
              <span className="absolute px-3 bg-slate-950 text-xs font-semibold text-slate-600 uppercase tracking-widest">
                or
              </span>
              <div className="w-full border-t border-slate-800" />
            </div>

            {/* Sandbox / Demo Login */}
            <button
              id="sandbox-login-btn"
              onClick={handleSandboxLogin}
              disabled={sandboxLoading}
              className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white font-semibold rounded-xl transition-all duration-200 ${
                !acceptedTerms ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {sandboxLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  Try Demo (Sandbox Mode)
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-slate-600 leading-relaxed max-w-xs mx-auto">
              Demo mode gives you a pre-seeded business profile to explore all features without connecting Google.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800/50">
            <div className="text-center p-2">
              <div className="text-violet-400 font-black text-lg">500+</div>
              <div className="text-slate-600 text-[10px]">Businesses</div>
            </div>
            <div className="text-center p-2 border-x border-slate-800/50">
              <div className="text-violet-400 font-black text-lg">4.9★</div>
              <div className="text-slate-600 text-[10px]">Avg Rating</div>
            </div>
            <div className="text-center p-2">
              <div className="text-violet-400 font-black text-lg">2M+</div>
              <div className="text-slate-600 text-[10px]">AI Replies</div>
            </div>
          </div>
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute -top-24 -right-24 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            <h3 className="text-lg font-black text-white flex items-center gap-2 relative">
              <Sparkles className="h-5 w-5 text-violet-400" />
              Terms of Service
            </h3>
            <div className="text-xs text-slate-300 space-y-3.5 max-h-[50vh] overflow-y-auto leading-relaxed border-y border-slate-800/80 py-4 pr-1 relative">
              <p><strong>1. Acceptance of Terms:</strong> By signing in, you agree to comply with and be bound by these Terms of Service.</p>
              <p><strong>2. Google Profile Access:</strong> You grant BizLocalPilot permission to manage your Google My Business profile via Google OAuth APIs.</p>
              <p><strong>3. Review Response Automation:</strong> You authorize BizLocalPilot AI to publish AI-generated replies to your Google Maps review section.</p>
              <p><strong>4. Subscription Billing:</strong> New users get a 14-day free Premium trial. After that, a billing plan is required via Razorpay.</p>
              <p><strong>5. DPDP Act &amp; Data Erasure:</strong> Compliant with India's DPDP Act 2023. You can delete your account and all data from Settings at any time.</p>
            </div>
            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-violet-600/25 relative"
            >
              Accept &amp; Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
