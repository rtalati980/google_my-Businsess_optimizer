'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ShieldCheck, ArrowLeft, Lock, Trash2, Key, Users } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500 selection:text-white pb-20">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-violet-600/10 to-transparent blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-violet-600/20 border border-violet-500/30 rounded-lg">
              <Sparkles className="h-4.5 w-4.5 text-violet-400" />
            </div>
            <span className="font-extrabold text-sm text-white">BizLocalPilot</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 mt-12 relative space-y-10">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-400">
            Last Updated: July 1, 2026. Fully compliant with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India.
          </p>
        </div>

        {/* Introduction Alert */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 text-sm leading-relaxed text-slate-300">
          At <strong>BizLocalPilot</strong> (referred to as "we", "us", or "the Platform"), we are committed to safeguarding your personal and business data. Under the Digital Personal Data Protection Act (DPDP Act 2023) of India, we act as a <strong>Data Fiduciary</strong>, and you are the <strong>Data Principal</strong>. This policy details the consent-driven collection, storage, and processing of your details.
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {/* Section 1 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-400" />
              1. What Personal Data We Collect
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We collect the minimum amount of personal data necessary to provide and optimize our local business dashboard services:
            </p>
            <ul className="text-sm text-slate-300 pl-6 list-disc space-y-1.5">
              <li><strong>User Identity Data:</strong> Your name, email address, and avatar photo retrieved during Google Sign-In.</li>
              <li><strong>Google API OAuth Tokens:</strong> Access tokens and refresh tokens granted during authentication to interface with the Google Business Profile APIs on your behalf.</li>
              <li><strong>Business Profile Data:</strong> Location IDs, storefront address, phone number, categories, reviews, star ratings, and owner response logs synced from your Google Maps listings.</li>
              <li><strong>Payment Data:</strong> Payment details (order ID, transactions, amount) processed securely via Razorpay. We do not store raw credit card numbers or UPI PINs on our servers.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="h-5 w-5 text-violet-400" />
              2. Purpose of Data Processing (Lawful Basis)
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              We process your personal and business data solely for the following explicit purposes:
            </p>
            <ul className="text-sm text-slate-300 pl-6 list-disc space-y-1.5">
              <li>To allow you to draft, schedule, and publish posts and local updates to Google Maps.</li>
              <li>To fetch, analyze, and enable owner replies on GMB customer reviews (either manually or via Claude AI generator).</li>
              <li>To generate automated Weekly Performance Reports and local SEO audits.</li>
              <li>To manage your premium billing subscriptions securely via Razorpay.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="h-5 w-5 text-violet-400" />
              3. Data Security & Storage
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              All data is stored securely in encrypted cloud databases. Access tokens are transmitted over TLS (HTTPS) and refreshed securely. We do not sell, rent, or trade your personal information or GMB profile details to third-party brokers or advertisers under any circumstances.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-violet-400" />
              4. Right to Erasure (DPDP Compliance)
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Under the DPDP Act 2023, you have the absolute **Right to Erasure and Permanent Removal**. You can trigger this at any time:
            </p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Go to **Settings** inside your Dashboard, click on **Delete Account**, and confirm. The system will immediately execute a permanent wipe of your user profile, billing details, GMB OAuth credentials, saved locations, AI audits, drafts, and reviews database logs from our MongoDB servers instantly.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="border-t border-slate-800 pt-8 text-center text-xs text-slate-500">
          For any privacy questions or to contact our Data Protection Officer, please email support@bizlocalpilot.com.
        </div>
      </main>
    </div>
  );
}
