import React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import AuditFormClient from './AuditFormClient';

export const metadata = {
  title: 'Free Google Maps Audit | BizLocalPilot AI',
  description: 'Get a free ₹10,000 audit of your Google Business Profile. See exactly why you\'re not ranking #1 on Google Maps and get your personalized action plan.',
};

export default function FreeAuditPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-sky-50">
      {/* Back to home link */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/landing" className="inline-flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-semibold">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-violet-100 mb-4">
            <Sparkles className="h-8 w-8 text-violet-600" aria-hidden="true" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4">
            Your Free Google Maps Audit
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            ₹10,000 value. Absolutely free.
          </p>
          <p className="text-gray-500">
            Takes 5 minutes to fill. Results delivered within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <AuditFormClient />
          </div>

          {/* Benefits Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-100 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">What You'll Get:</h3>
              <ul className="space-y-3">
                {[
                  'Your current Google Maps ranking',
                  'Why you\'re not ranking #1',
                  '3 quick wins you can implement today',
                  'Your 60-day ranking plan',
                  'Keyword opportunities',
                  'Competitor gap analysis'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-violet-200">
                <p className="text-xs text-gray-600">
                  <strong>100% Free.</strong> No credit card. No strings. No sales pitch.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Trusted by 120+ businesses across India</p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Fast results
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Real insights
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
              Your data safe
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
