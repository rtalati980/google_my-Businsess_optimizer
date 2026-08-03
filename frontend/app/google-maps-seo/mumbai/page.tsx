import { Metadata } from 'next';
import MumbaiContent from './MumbaiContent';

export const metadata: Metadata = {
  title: 'Google Maps SEO for Mumbai: Rank #1 in Mumbai - BizLocalPilot AI',
  description: 'Get expert Google Maps ranking tips for Mumbai businesses. Increase your visibility on Google Maps in Mumbai with our AI-powered optimization guide. Free audit included.',
  keywords: [
    'Google Maps SEO Mumbai',
    'How to rank on Google Maps Mumbai',
    'Mumbai local business ranking',
    'Google Business Profile Mumbai',
    'Restaurant ranking Mumbai',
    'Best practices Google Maps',
  ],
  openGraph: {
    title: 'Google Maps SEO for Mumbai: Rank #1 in Mumbai - BizLocalPilot AI',
    description: 'Complete guide to ranking #1 on Google Maps in Mumbai. Learn proven strategies used by top businesses.',
    type: 'article',
    url: 'https://bizlocalpilot.com/google-maps-seo/mumbai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Google Maps SEO for Mumbai - Rank #1',
    description: 'Expert guide for Mumbai businesses to rank higher on Google Maps and get more customers.',
  },
  alternates: {
    canonical: 'https://bizlocalpilot.ai/google-maps-seo/mumbai',
  },
};

export default function MumbaiPage() {
  return <MumbaiContent />;
}
