/**
 * Landing Page — Server Component (no 'use client')
 *
 * This page is intentionally a React Server Component so that:
 *  1. ALL content is rendered as static HTML by Next.js
 *  2. Google, Bing, and other crawlers can read the full page without JavaScript
 *  3. Core Web Vitals are optimised (LCP, CLS, FID)
 *  4. The page appears in Google's index with full content
 *
 * The interactive animations (framer-motion, carousel, counter) are
 * delegated to LandingClient.tsx via 'use client'.
 */

import LandingClient from './LandingClient';

export default function LandingPage() {
  return <LandingClient />;
}
