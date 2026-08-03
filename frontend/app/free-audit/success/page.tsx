import React from 'react';
import Link from 'next/link';
import { CheckCircle2, Mail, Clock, MessageSquare } from 'lucide-react';
import ConversionTracker from './ConversionTracker';

export const metadata = {
  title: 'Audit Request Received | BizLocalPilot AI',
  description: 'Your free Google Maps audit request has been received. Check your email within 24 hours for your personalized results.',
};

export default function AuditSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Track conversion in Google Ads & Analytics */}
      <ConversionTracker />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            ✅ Audit Request Received!
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            We're analyzing your Google Business Profile right now.
          </p>
          <p className="text-gray-500">
            Your personalized audit report will be in your inbox within 24 hours.
          </p>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next:</h2>

          <div className="space-y-4">
            {[
              {
                icon: Mail,
                step: '1. Check Your Email',
                desc: 'Look for an email from hello@codecrafters.co.in with your audit results (check spam if needed)',
                color: '#7c3aed'
              },
              {
                icon: Clock,
                step: '2. Review Your Ranking Gap',
                desc: 'See exactly why you\'re not ranking #1 and what\'s blocking you from getting there',
                color: '#0284c7'
              },
              {
                icon: CheckCircle2,
                step: '3. Get Your Action Plan',
                desc: 'Receive 3 quick wins you can implement today + your 60-day ranking strategy',
                color: '#16a34a'
              },
              {
                icon: MessageSquare,
                step: '4. Chat With Us (Optional)',
                desc: 'We\'ll be available for WhatsApp if you want to discuss your results',
                color: '#d97706'
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-10 w-10 rounded-full" style={{ backgroundColor: `${item.color}20` }}>
                    <item.icon className="h-5 w-5" style={{ color: item.color }} aria-hidden="true" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{item.step}</h3>
                  <p className="text-gray-600 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What You'll Get */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-8 border border-violet-100 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">In Your Audit Report:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              '📍 Current Google Maps ranking',
              '🔍 Why you\'re not #1',
              '⚡ 3 quick wins (actionable today)',
              '📊 60-day ranking roadmap',
              '🎯 Missing keyword opportunities',
              '🏆 Competitor gap analysis'
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-700">
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Questions?</h3>
          <div className="space-y-3">
            <details className="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:border-violet-200 transition-colors">
              <summary className="font-semibold text-gray-900">When will I get my audit results?</summary>
              <p className="text-gray-600 text-sm mt-2">Usually within 24 hours. You'll receive an email directly to the address you provided.</p>
            </details>
            <details className="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:border-violet-200 transition-colors">
              <summary className="font-semibold text-gray-900">Will you try to sell me something?</summary>
              <p className="text-gray-600 text-sm mt-2">Nope! This audit is 100% free with no strings attached. We'll include our plans if you're interested, but no hard sell.</p>
            </details>
            <details className="bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:border-violet-200 transition-colors">
              <summary className="font-semibold text-gray-900">Can I talk to someone about my results?</summary>
              <p className="text-gray-600 text-sm mt-2">Absolutely! Reply to the email or reach out via WhatsApp at +91 82641 71623.</p>
            </details>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Meanwhile, explore more about ranking on Google Maps:
          </p>
          <Link href="/landing" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-200">
            Back to Home
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4">Your data is safe with us</p>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              No password stored
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              SSL encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              GDPR compliant
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
