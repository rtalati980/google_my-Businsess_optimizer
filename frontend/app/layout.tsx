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
    default: "BizLocalPilot AI — #1 Google Business Profile AI Tool | Rank Higher on Google Maps",
    template: "%s | BizLocalPilot AI",
  },
  description:
    "India's #1 AI-powered Google Business Profile optimizer. Auto-reply to reviews, generate SEO posts, audit your profile, track competitors, and rank higher on Google Maps — all powered by Google Gemini AI. Free plan forever.",
  keywords: [
    "Google Business Profile management",
    "Google My Business AI India",
    "AI review reply generator",
    "local SEO tool India",
    "Google Maps ranking tool",
    "GMB post scheduler",
    "business profile optimizer",
    "local business SEO",
    "competitor tracking Google Maps",
    "how to rank higher on Google Maps",
    "BizLocalPilot",
    "BizLocalPilot AI",
    "Gemini AI for business",
    "AI tool for local businesses India",
  ],
  authors: [{ name: "BizLocalPilot AI", url: "https://bizlocalpilot.ai" }],
  creator: "BizLocalPilot AI",
  publisher: "BizLocalPilot AI",
  category: "Technology",
  classification: "Business Software",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://bizlocalpilot.ai",
    title: "BizLocalPilot AI — Rank Higher on Google Maps with Gemini AI",
    description:
      "Auto-reply to reviews, generate SEO posts, audit your profile, and rank higher on Google Maps. Built for Indian restaurants, salons, clinics & shops. Free plan forever.",
    siteName: "BizLocalPilot AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BizLocalPilot AI — AI-powered Google Business Profile management for Indian businesses",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@bizlocalpilot",
    creator: "@bizlocalpilot",
    title: "BizLocalPilot AI — Rank Higher on Google Maps",
    description:
      "AI-powered Google Business Profile management for Indian businesses. Reviews, posts, SEO audits, competitor tracking — all automated. Free plan forever.",
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
  verification: {
    // Add your actual verification codes when you get them:
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    // bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
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
        "India's #1 AI-powered SaaS platform for local businesses to optimize Google Business Profiles, auto-reply to reviews, generate SEO posts, and track competitor rankings on Google Maps.",
      operatingSystem: "Web Browser",
      url: "https://bizlocalpilot.ai",
      screenshot: "https://bizlocalpilot.ai/og-image.png",
      featureList: [
        "AI Review Reply Generator",
        "Google Posts AI Scheduler",
        "Business Profile SEO Audit",
        "Local SEO Optimizer",
        "Competitor Analysis",
        "Festival Content Generator",
        "Multi-language Support (Hindi, Tamil, Telugu, Kannada)",
        "Performance Analytics",
        "Custom AI Image Generation",
        "Multi-location Dashboard",
      ],
      offers: [
        {
          "@type": "Offer",
          name: "Free Plan",
          price: "0",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Starter Plan",
          price: "499",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Growth Plan",
          price: "1499",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
        },
        {
          "@type": "Offer",
          name: "Agency Plan",
          price: "3999",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
          availability: "https://schema.org/InStock",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        bestRating: "5",
        reviewCount: "120",
      },
    },
    {
      "@type": "Organization",
      name: "BizLocalPilot AI",
      url: "https://bizlocalpilot.ai",
      logo: "https://bizlocalpilot.ai/og-image.png",
      description:
        "Helping Indian businesses rank higher on Google Maps with AI-powered profile optimization.",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "support@bizlocalpilot.ai",
      },
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
