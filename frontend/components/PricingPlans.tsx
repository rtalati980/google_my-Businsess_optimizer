'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PricingPlans() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 sm:p-12">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <span className="inline-block px-4 py-1.5 bg-violet-500/20 text-violet-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-violet-500/30">
          🎉 Free Beta Testing Phase
        </span>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4">
          All Features 100% Free & Unlimited
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          BizLocalPilot AI is currently available for testing. All subscription plans and paywalls are disabled, giving you full unlimited access to every feature.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8 max-w-xl mx-auto">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-200">Unlimited Locations &amp; Profiles</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-200">Unlimited Gemini AI Replies</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-200">AI Post Generator &amp; Scheduler</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-slate-200">Competitor Ranking Tracker</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2.5 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-violet-600/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="h-5 w-5 text-violet-200" />
          <span>Go to Dashboard</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
