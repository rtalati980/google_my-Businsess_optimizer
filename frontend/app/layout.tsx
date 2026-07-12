import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://bizlocalpilot.ai"),
  title: {
    default: "BizLocalPilot AI — Grow Your Business on Google Maps with AI",
    template: "%s | BizLocalPilot AI",
  },
  description:
    "India's #1 AI-powered Google Business Profile optimizer. Auto-reply to reviews, generate SEO posts, audit your profile, track competitors, and rank higher on Google Maps — all on autopilot.",
  keywords: [
    "Google Business Profile management",
    "Google My Business AI India",
    "AI review reply generator",
    "local SEO tool India",
    "Google Maps ranking tool",
    "GMB post scheduler",
    "business profile optimizer",
    "local business SEO",
    "competitor tracking",
    "BizLocalPilot",
  ],
  authors: [{ name: "BizLocalPilot AI" }],
  creator: "BizLocalPilot AI",
  publisher: "BizLocalPilot AI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bizlocalpilot.ai",
    title: "BizLocalPilot AI — Grow Your Business on Google Maps with AI",
    description:
      "Auto-reply to reviews, generate SEO posts, audit your profile, and rank higher on Google Maps. Built for Indian businesses.",
    siteName: "BizLocalPilot AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BizLocalPilot AI Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BizLocalPilot AI — Rank Higher on Google Maps",
    description:
      "AI-powered Google Business Profile management for Indian businesses. Reviews, posts, SEO audits, competitor tracking — all automated.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://bizlocalpilot.ai",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "BizLocalPilot AI",
      applicationCategory: "BusinessApplication",
      description:
        "India's #1 AI-powered SaaS platform for local businesses to optimize Google Business Profiles, auto-reply to reviews, generate SEO posts, and track competitor rankings.",
      operatingSystem: "Web",
      url: "https://bizlocalpilot.ai",
      offers: {
        "@type": "Offer",
        price: "499",
        priceCurrency: "INR",
        priceValidUntil: "2027-12-31",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "250",
      },
      featureList: [
        "AI Review Reply Generator",
        "Google Posts AI Scheduler",
        "Business Profile Audit",
        "Local SEO Optimizer",
        "Competitor Analysis",
        "Festival Content Generator",
        "Multi-language Support",
        "Performance Analytics",
      ],
    },
    {
      "@type": "Organization",
      name: "BizLocalPilot AI",
      url: "https://bizlocalpilot.ai",
      description:
        "Helping Indian businesses rank higher on Google Maps with AI-powered profile optimization.",
    },
    {
      "@type": "WebSite",
      name: "BizLocalPilot AI",
      url: "https://bizlocalpilot.ai",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://bizlocalpilot.ai/store/{search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="h-full bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
