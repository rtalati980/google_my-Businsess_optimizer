import type { Metadata } from 'next';

// ── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'BizLocalPilot AI — #1 Google Business Profile AI Tool for India | Rank Higher on Google Maps',
  description:
    'Auto-reply to Google reviews with AI, schedule GMB posts, audit your SEO score, track competitors, and rank #1 on Google Maps. Trusted by 120+ local businesses across India. Free forever plan. No credit card needed.',
  keywords: [
    // Primary intent keywords
    'Google Business Profile management tool India',
    'Google My Business AI tool',
    'Google Maps ranking tool India',
    'AI review reply generator India',
    'GMB post scheduler India',
    'local SEO tool India',
    'Google Business Profile optimizer',
    // Long-tail keywords
    'how to rank higher on Google Maps',
    'auto reply to Google reviews with AI',
    'Google My Business management software',
    'best local SEO tool for restaurants India',
    'AI tool for salons Google Maps',
    'review management software India',
    'Google Business Profile audit tool',
    'competitor tracking Google Maps India',
    // Gemini / AI keywords
    'Gemini AI for local businesses',
    'AI post generator for Google Business',
    'AI content generator for small business India',
    // Brand
    'BizLocalPilot AI',
    'BizLocalPilot',
  ],
  alternates: {
    canonical: 'https://bizlocalpilot.ai/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://bizlocalpilot.ai/',
    siteName: 'BizLocalPilot AI',
    title: 'BizLocalPilot AI — Rank #1 on Google Maps with Gemini AI',
    description:
      'Auto-reply to Google reviews, schedule GMB posts, audit SEO, track competitors — all powered by Google Gemini AI. Built for Indian restaurants, salons, clinics, shops & more. Free plan available.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BizLocalPilot AI — AI-powered Google Business Profile management dashboard for Indian businesses',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@bizlocalpilot',
    creator: '@bizlocalpilot',
    title: 'BizLocalPilot AI — Rank Higher on Google Maps with AI',
    description:
      'AI-powered Google Business Profile management for Indian businesses. Auto-reply to reviews, post scheduler, SEO audits, competitor tracking — all automated. Free plan forever.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// ── Structured Data Schemas ──────────────────────────────────────────────────

/** FAQPage schema — helps Google show FAQ rich results in SERP */
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I need a verified Google Business Profile to use BizLocalPilot AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, you need a verified Google Business Profile (formerly Google My Business). However, you can start testing with our Sandbox Mode instantly — no Google account connection needed. Verification takes about 5 minutes.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI generate review replies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "We use Google's Gemini AI model. It reads the reviewer's tone, star rating, and your business type to craft perfectly tailored, human-sounding responses in seconds. You can choose from 5 tone styles — Professional, Friendly, Luxury, Healthcare, or Restaurant.",
      },
    },
    {
      '@type': 'Question',
      name: 'Will Google penalize AI-written review replies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Google has no policy against AI-assisted replies. Every reply is reviewed and published by you — it always looks and feels human. Google only cares that your replies are genuine and not spammy, which our AI ensures.',
      },
    },
    {
      '@type': 'Question',
      name: 'How quickly will my Google Maps ranking improve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most businesses see measurable improvement in 3–6 weeks of consistent posting and responding to reviews with our tool. Google rewards businesses that are actively engaging — and BizLocalPilot AI makes that effortless.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my Google account data safe with BizLocalPilot AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. We use Google OAuth 2.0 (same as "Sign in with Google"). We never see or store your password. All tokens are encrypted. BizLocalPilot AI is compliant with India\'s DPDP Act 2023.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does BizLocalPilot AI work for restaurants, salons, clinics, and shops?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! BizLocalPilot AI is designed for all types of local businesses — restaurants, salons, clinics, pharmacies, retailers, gyms, coaching centers, hotels, and more. The AI automatically adapts its replies, posts, and SEO recommendations to your specific business category.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I manage multiple Google Business locations?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The Growth plan supports up to 3 locations for ₹1,499/month. The Agency plan supports unlimited locations for ₹3,999/month. Each location gets its own AI-powered dashboard with separate analytics.',
      },
    },
    {
      '@type': 'Question',
      name: 'What languages does BizLocalPilot AI support for review replies?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "The AI supports English, Hindi, Marathi, Tamil, Telugu, Kannada, Gujarati, Bengali, and more. It automatically detects the reviewer's language and replies accordingly.",
      },
    },
    {
      '@type': 'Question',
      name: 'What is the pricing for BizLocalPilot AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BizLocalPilot AI offers 4 plans: Free (₹0/month — generate AI content, no direct publishing), Starter (₹499/month — 1 location, publish to Google), Growth (₹1,499/month — up to 3 locations), and Agency (₹3,999/month — unlimited locations). All plans start with AI content generation. Paid plans unlock direct publishing to Google.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is BizLocalPilot AI different from other Google My Business tools?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BizLocalPilot AI is the only GMB tool built specifically for Indian businesses, powered by Google Gemini AI. Unlike generic tools, it understands Indian business types, local festivals, regional languages, and India-specific customer behavior. It also provides a 0–100 SEO health score, competitor tracking, and AI-generated posts with custom image generation — all in one dashboard.',
      },
    },
  ],
};

/** Product / SoftwareApplication schema */
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'BizLocalPilot AI',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  url: 'https://bizlocalpilot.ai',
  description:
    "India's #1 AI-powered SaaS platform for local businesses to optimize Google Business Profiles, auto-reply to customer reviews using Gemini AI, schedule SEO posts, track competitors, and rank higher on Google Maps.",
  screenshot: 'https://bizlocalpilot.ai/og-image.png',
  featureList: [
    'AI Review Reply Generator powered by Google Gemini',
    'Google Business Profile Post Scheduler',
    'AI SEO Auditor with 0–100 health score',
    'Competitor Tracker for Google Maps',
    'Weekly AI Performance Reports',
    'Public Store Pages for each business location',
    'Multi-language support for Indian languages',
    'Festival content generator',
    'Custom AI image generation for posts',
    'Multi-location dashboard management',
  ],
  offers: [
    {
      '@type': 'Offer',
      name: 'Free Plan',
      price: '0',
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      description: 'Try it — no credit card needed. 1 Location, 10 AI Reply Suggestions/month, 5 AI Post Generations/month',
    },
    {
      '@type': 'Offer',
      name: 'Starter Plan',
      price: '499',
      priceCurrency: 'INR',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      description: '1 Location, 50 AI Reply Suggestions/month, Unlimited Post Generation, Direct Google Publishing',
    },
    {
      '@type': 'Offer',
      name: 'Growth Plan',
      price: '1499',
      priceCurrency: 'INR',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      description: 'Up to 3 Locations, 200 AI Reply Suggestions/month, Unlimited Everything, Full SEO Auditor, Competitor Tracker',
    },
    {
      '@type': 'Offer',
      name: 'Agency Plan',
      price: '3999',
      priceCurrency: 'INR',
      priceValidUntil: '2027-12-31',
      availability: 'https://schema.org/InStock',
      description: 'Unlimited Locations, Unlimited AI Replies, White-label Dashboard, Dedicated Account Manager',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    bestRating: '5',
    worstRating: '1',
    reviewCount: '120',
  },
  provider: {
    '@type': 'Organization',
    name: 'BizLocalPilot AI',
    url: 'https://bizlocalpilot.ai',
  },
};

/** Organization schema */
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'BizLocalPilot AI',
  legalName: 'CodeCrafters Technologies',
  url: 'https://bizlocalpilot.ai',
  logo: 'https://bizlocalpilot.ai/og-image.png',
  description:
    'Helping Indian local businesses grow on Google Maps with AI-powered Google Business Profile optimization.',
  foundingLocation: {
    '@type': 'Place',
    name: 'Mumbai, India',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Guruprupa, Jawahar Nagar Road-4',
    addressLocality: 'Goregaon West',
    addressRegion: 'Maharashtra',
    postalCode: '400104',
    addressCountry: 'IN',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@codecrafters.co.in',
      telephone: '+918264171623',
      availableLanguage: ['English', 'Hindi'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+918264171623',
      contactOption: 'https://schema.org/TollFree',
    },
  ],
  sameAs: [
    'https://codecrafters.co.in',
    'https://twitter.com/bizlocalpilot',
    'https://www.linkedin.com/company/bizlocalpilot',
  ],
};

/** WebSite schema with Sitelinks SearchBox */
const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BizLocalPilot AI',
  url: 'https://bizlocalpilot.ai',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://bizlocalpilot.ai/store/{search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

/** BreadcrumbList schema */
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://bizlocalpilot.ai/',
    },
  ],
};

/** HowTo schema — "How to rank higher on Google Maps" */
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Rank Higher on Google Maps with AI',
  description:
    'A step-by-step guide to improving your Google Maps ranking using BizLocalPilot AI — the AI-powered Google Business Profile management tool.',
  totalTime: 'PT3M',
  supply: [
    { '@type': 'HowToSupply', name: 'Google Business Profile (verified)' },
    { '@type': 'HowToSupply', name: 'BizLocalPilot AI account (free)' },
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Connect Your Google Business Profile',
      text: 'Sign in with your Google account and link your verified Google Business Profile to BizLocalPilot AI. Takes 60 seconds.',
      position: 1,
    },
    {
      '@type': 'HowToStep',
      name: 'Run an AI SEO Audit',
      text: 'Gemini AI scans your profile and gives you a 0–100 SEO health score with actionable improvement suggestions.',
      position: 2,
    },
    {
      '@type': 'HowToStep',
      name: 'Activate AI Review Replies',
      text: 'Enable AI-powered review replies. The AI generates tone-matched responses to every new review in seconds.',
      position: 3,
    },
    {
      '@type': 'HowToStep',
      name: 'Schedule Weekly Posts',
      text: 'Use the AI post generator to create and schedule weekly updates, offers, and announcements to Google Business.',
      position: 4,
    },
    {
      '@type': 'HowToStep',
      name: 'Watch Your Google Maps Ranking Improve',
      text: 'Google rewards active, responsive businesses. See your Google Maps ranking improve in 3–6 weeks.',
      position: 5,
    },
  ],
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* ── Structured Data ─────────────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      {children}
    </>
  );
}
