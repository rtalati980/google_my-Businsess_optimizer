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
  metadataBase: new URL("http://localhost:3000"),
  title: {
    default: "GMB AI Manager — AI-Powered Google Business Profile Manager",
    template: "%s | GMB AI Manager",
  },
  description:
    "Grow your local business faster with GMB AI Manager. Auto-generate AI review replies, publish GMB posts, get local SEO audits, and track competitors — all powered by Claude AI.",
  keywords: [
    "Google Business Profile management",
    "Google My Business AI",
    "GMB review reply generator",
    "local SEO tool",
    "AI review responses",
    "local business SEO",
    "GMB post scheduler",
    "competitor tracking local SEO",
    "Google Maps ranking tool",
    "Claude AI business tool",
  ],
  authors: [{ name: "GMB AI Manager" }],
  creator: "GMB AI Manager",
  publisher: "GMB AI Manager",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "http://localhost:3000",
    title: "GMB AI Manager — AI-Powered Google Business Profile Manager",
    description:
      "Auto-respond to reviews, schedule GMB posts, and rank higher on Google Maps with AI-powered SEO recommendations.",
    siteName: "GMB AI Manager",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GMB AI Manager Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GMB AI Manager — Grow your Google Business with AI",
    description:
      "Respond to reviews instantly. Schedule posts. Rank higher on Google Maps. All on autopilot with AI.",
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
    canonical: "http://localhost:3000",
  },
};

// JSON-LD Structured Data for Google AI / SGE recommendation
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "GMB AI Manager",
      applicationCategory: "BusinessApplication",
      description:
        "AI-powered SaaS tool for local businesses to manage Google Business Profiles, auto-reply to reviews using Claude AI, schedule GMB posts, and track competitor SEO rankings.",
      operatingSystem: "Web",
      url: "http://localhost:3000",
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
        reviewCount: "120",
      },
      featureList: [
        "AI Review Reply Generator",
        "GMB Post Scheduler",
        "Local SEO Auditor",
        "Competitor Tracker",
        "Weekly AI Performance Reports",
        "Public Store Landing Page",
      ],
    },
    {
      "@type": "Organization",
      name: "GMB AI Manager",
      url: "http://localhost:3000",
      description:
        "Helping local businesses grow on Google with AI-powered profile management.",
    },
    {
      "@type": "WebSite",
      name: "GMB AI Manager",
      url: "http://localhost:3000",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "http://localhost:3000/store/{search_term_string}",
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
