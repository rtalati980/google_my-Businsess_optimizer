import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — BizLocalPilot AI',
  description:
    'Read the Terms of Service for BizLocalPilot AI. Learn about your rights, responsibilities, and our service commitments when using our AI-powered Google Business Profile management platform.',
  alternates: { canonical: 'https://bizlocalpilot.ai/terms' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const lastUpdated = 'July 29, 2026';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Terms of Service</h1>
          <p className="text-violet-200 text-sm">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="prose prose-gray max-w-none space-y-10">

          {/* Intro */}
          <div className="p-6 bg-violet-50 border border-violet-100 rounded-2xl">
            <p className="text-gray-700 leading-relaxed">
              Welcome to <strong>BizLocalPilot AI</strong>, a product of{' '}
              <a href="https://codecrafters.co.in" target="_blank" rel="noopener noreferrer"
                className="text-violet-600 font-bold hover:underline">
                CodeCrafters Technologies
              </a>. By accessing or using our platform at{' '}
              <a href="https://bizlocalpilot.ai" className="text-violet-600 hover:underline">bizlocalpilot.ai</a>,
              you agree to be bound by these Terms of Service. Please read them carefully.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">1</span>
              Acceptance of Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              By creating an account or using any part of BizLocalPilot AI, you confirm that you are at least 18 years of age,
              have the legal capacity to enter into a binding agreement, and accept these Terms of Service in full.
              If you are using the service on behalf of a business, you represent that you have authority to bind that business.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">2</span>
              Description of Service
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              BizLocalPilot AI provides an AI-powered platform for Google Business Profile management, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>AI-generated review reply suggestions powered by Google Gemini AI</li>
              <li>Google Business Profile post scheduling and generation</li>
              <li>SEO health auditing and keyword recommendations</li>
              <li>Competitor tracking and analysis</li>
              <li>Weekly AI performance reports</li>
              <li>Public store pages for each business location</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">3</span>
              User Accounts &amp; Registration
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You must sign in using your Google account via OAuth 2.0. By doing so, you grant us read and write access
              to your Google Business Profile as required to deliver our services. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Maintaining the security of your Google account</li>
              <li>All activities that occur under your BizLocalPilot AI account</li>
              <li>Ensuring your Google Business Profile is verified and compliant with Google's policies</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">4</span>
              Subscription Plans &amp; Billing
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>BizLocalPilot AI offers the following subscription plans:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { plan: 'Free', price: '₹0/month', desc: '1 location, 10 AI replies, generate-only (no direct publishing)' },
                  { plan: 'Starter', price: '₹499/month', desc: '1 location, 50 AI replies, direct publishing to Google' },
                  { plan: 'Growth', price: '₹1,499/month', desc: 'Up to 3 locations, 200 AI replies, full features' },
                  { plan: 'Agency', price: '₹3,999/month', desc: 'Unlimited locations, unlimited AI replies, white-label' },
                ].map(p => (
                  <div key={p.plan} className="p-4 border border-gray-200 rounded-xl">
                    <div className="font-bold text-gray-900">{p.plan} — <span className="text-violet-600">{p.price}</span></div>
                    <div className="text-sm mt-1">{p.desc}</div>
                  </div>
                ))}
              </div>
              <p>
                All payments are processed securely via <strong>Razorpay</strong>. Subscriptions renew monthly unless cancelled.
                Refunds are handled on a case-by-case basis; contact us within 7 days of billing if you have concerns.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">5</span>
              Acceptable Use Policy
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">You agree NOT to use BizLocalPilot AI to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Post fake, misleading, or defamatory reviews or replies</li>
              <li>Violate Google's Terms of Service or Business Profile policies</li>
              <li>Spam customers or post excessive automated content</li>
              <li>Impersonate any business, person, or entity</li>
              <li>Use the platform for any illegal purpose under Indian law</li>
              <li>Reverse-engineer, copy, or resell our AI models or systems</li>
              <li>Attempt to gain unauthorized access to other users' accounts</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">6</span>
              AI-Generated Content Disclaimer
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              BizLocalPilot AI uses Google Gemini AI to generate content suggestions (review replies, posts, reports).
              This content is <strong>suggestive only</strong> — you are solely responsible for reviewing and approving
              any content before it is published to your Google Business Profile.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We do not guarantee accuracy, completeness, or suitability of AI-generated content for your specific business.
              Published content must comply with Google's Review Reply policies and applicable laws.
            </p>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">7</span>
              Privacy &amp; Data Protection
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We collect and process your data in accordance with our{' '}
              <a href="/privacy" className="text-violet-600 font-bold hover:underline">Privacy Policy</a> and India's
              Digital Personal Data Protection (DPDP) Act, 2023. We use Google OAuth 2.0 for authentication — we never
              store your Google password. Your business data is used solely to provide and improve our services.
            </p>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">8</span>
              Intellectual Property
            </h2>
            <p className="text-gray-600 leading-relaxed">
              All content, design, code, branding, and intellectual property on BizLocalPilot AI is owned by
              <strong> CodeCrafters Technologies</strong>. You retain ownership of your business data and
              content published to Google. You grant us a limited licence to process your data to deliver our services.
              You may not copy, reproduce, or redistribute our platform without written consent.
            </p>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">9</span>
              Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              To the maximum extent permitted by law, CodeCrafters Technologies shall not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Any changes Google makes to its Business Profile API or ranking algorithms</li>
              <li>Loss of revenue, customers, or Google Maps ranking position</li>
              <li>Indirect, incidental, or consequential damages arising from use of the platform</li>
              <li>Service interruptions caused by Google, Razorpay, or third-party providers</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Our total liability to you shall not exceed the amount paid by you in the last 3 months.
            </p>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">10</span>
              Termination
            </h2>
            <p className="text-gray-600 leading-relaxed">
              You may cancel your account at any time from your dashboard settings. We reserve the right to suspend or
              terminate accounts that violate these Terms, engage in fraudulent activity, or abuse our platform.
              Upon termination, your data will be retained for 30 days before deletion, unless legally required otherwise.
            </p>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">11</span>
              Governing Law &amp; Dispute Resolution
            </h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of India. Any disputes arising from these Terms or use of our platform
              shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.
              We encourage resolving disputes amicably — please contact us first at{' '}
              <a href="mailto:hello@codecrafters.co.in" className="text-violet-600 hover:underline">
                hello@codecrafters.co.in
              </a>.
            </p>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="inline-flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-sm font-black items-center justify-center">12</span>
              Changes to Terms
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms from time to time. We will notify you of material changes via email or a notice
              on our platform. Continued use of BizLocalPilot AI after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* Contact */}
          <div className="p-8 bg-gray-900 rounded-2xl text-white">
            <h2 className="text-2xl font-black mb-6">Contact Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Company</p>
                <p className="font-bold text-white">CodeCrafters Technologies</p>
                <p className="text-gray-300 text-sm mt-1">Product: BizLocalPilot AI</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Address</p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Guruprupa, Jawahar Nagar Road-4,<br />
                  Goregaon West, Mumbai — 400104,<br />
                  Maharashtra, India 🇮🇳
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Email</p>
                <a href="mailto:hello@codecrafters.co.in"
                  className="text-violet-400 hover:text-violet-300 transition-colors text-sm">
                  hello@codecrafters.co.in
                </a>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Phone / WhatsApp</p>
                <a href="tel:+918264171623"
                  className="text-violet-400 hover:text-violet-300 transition-colors text-sm block">
                  📞 +91 82641 71623
                </a>
                <a href="https://wa.me/918264171623"
                  target="_blank" rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors text-sm block mt-1">
                  💬 WhatsApp: +91 82641 71623
                </a>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-bold">Website</p>
                <a href="https://codecrafters.co.in" target="_blank" rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 transition-colors text-sm">
                  codecrafters.co.in
                </a>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} BizLocalPilot AI — A product of{' '}
            <a href="https://codecrafters.co.in" target="_blank" rel="noopener noreferrer"
              className="text-violet-600 hover:underline font-semibold">CodeCrafters Technologies</a>.
            All rights reserved. Made in India 🇮🇳
          </p>
        </div>
      </div>
    </div>
  );
}
