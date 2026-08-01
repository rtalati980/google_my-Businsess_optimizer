'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView as useCountInView } from 'react-intersection-observer';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Sparkles, Star, MessageSquare, Megaphone, TrendingUp,
  BarChart2, Shield, CheckCircle2, ArrowRight, Globe,
  ChevronRight, Zap, MapPin, Phone, Menu, X, Rocket
} from 'lucide-react';

// ─── VARIANTS ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] as const }
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

// ─── DATA ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: MessageSquare, color: '#7c3aed', bg: '#f5f3ff', title: 'AI Review Replies', description: 'Gemini AI instantly writes perfect, tone-matched responses to every customer review — Professional, Friendly, Thankful, and more.' },
  { icon: Megaphone, color: '#0284c7', bg: '#f0f9ff', title: 'GMB Post Scheduler', description: 'Auto-schedule weekly posts, offers & announcements to keep your Google Business Profile fresh and actively ranked.' },
  { icon: TrendingUp, color: '#16a34a', bg: '#f0fdf4', title: 'AI SEO Auditor', description: 'Get a 0–100 SEO health score with actionable keyword suggestions and profile improvements to rank higher on Google Maps.' },
  { icon: BarChart2, color: '#d97706', bg: '#fffbeb', title: 'Weekly AI Reports', description: 'Every week, get a full performance report — sentiment analysis, top keywords, content ideas, and competitor comparison.' },
  { icon: Shield, color: '#dc2626', bg: '#fef2f2', title: 'Competitor Tracker', description: 'Monitor local competitor ratings, review count velocity, and posting frequency to spot gaps and opportunities.' },
  { icon: Globe, color: '#9333ea', bg: '#faf5ff', title: 'Public Store Pages', description: 'Each location gets a beautiful shareable web page showing ratings, photos, and owner replies — no developer needed.' },
];

const testimonials = [
  { name: 'Ananya Sharma', role: 'Restaurant Owner · Mumbai', rating: 5, text: 'Our Google Maps ranking jumped from #8 to #2 in just 3 weeks. The AI replies sound so natural — customers complimented us on how we respond!', avatar: 'A', color: '#7c3aed' },
  { name: 'Ravi Mehta', role: 'Salon Chain · Bengaluru', rating: 5, text: 'Managing 4 locations used to eat my entire weekend. Now AI handles replies and posts automatically. I save 8+ hours every week.', avatar: 'R', color: '#0284c7' },
  { name: 'Priya Nair', role: 'Dental Clinic · Chennai', rating: 5, text: '"Dentist near me" results tripled after the SEO Auditor showed me exact keywords I was missing. Best ROI tool for local businesses.', avatar: 'P', color: '#16a34a' },
  { name: 'Kartik Desai', role: 'Electronics Retailer · Ahmedabad', rating: 5, text: 'The post scheduler keeps our profile always "Recently active". Google loves this — we get 2x more calls than before.', avatar: 'K', color: '#d97706' },
  { name: 'Suhana Kapoor', role: 'Spa & Wellness · Delhi', rating: 5, text: 'We went from 18 to 67 reviews in 2 months using the public store page + QR code. Incredible tool for any local business owner.', avatar: 'S', color: '#dc2626' },
];

const stats = [
  { value: 120, suffix: '+', label: 'Local Businesses', color: '#7c3aed' },
  { value: 4.9, suffix: '/5', label: 'Average Rating', decimals: 1, color: '#16a34a' },
  { value: 40, suffix: '%', label: 'Avg Ranking Boost', color: '#0284c7' },
  { value: 8, suffix: 'h', label: 'Weekly Hours Saved', color: '#d97706' },
];

const pricingPlans = [
  {
    name: 'Free', price: '₹0', period: '/month', description: 'Try it — no credit card needed',
    features: ['1 Location', '10 AI Reply Suggestions/mo', '5 AI Post Generations/mo', 'SEO Audit (1/mo)', 'AI Growth Advisor (1/mo)', '⚠️ Generate only — manual publish'],
    cta: 'Get Started Free', highlight: false, planKey: 'FREE',
  },
  {
    name: 'Starter', price: '₹499', period: '/month', description: 'For single-location shops',
    features: ['1 Location', '50 AI Reply Suggestions/mo', 'Unlimited AI Post Generation', '✅ Publish directly to Google', '3 SEO Audits/month', 'AI Growth Advisor', 'Email Support'],
    cta: 'Upgrade to Starter', highlight: false, planKey: 'STARTER',
  },
  {
    name: 'Growth', price: '₹1,499', period: '/month', description: 'Best for growing brands', badge: '⭐ Most Popular',
    features: ['Up to 3 Locations', '200 AI Reply Suggestions/mo', 'Unlimited Everything', '✅ Publish directly to Google', 'Full SEO Auditor', 'Competitor Tracker', 'Priority Support'],
    cta: 'Get Growth Plan', highlight: true, planKey: 'GROWTH',
  },
  {
    name: 'Agency', price: '₹3,999', period: '/month', description: 'For agencies & franchises',
    features: ['Unlimited Locations', 'Unlimited AI Replies', 'White-label Dashboard', '✅ Publish directly to Google', 'Bulk Reports Export', 'Dedicated Manager', 'Custom API Access'],
    cta: 'Contact Sales', highlight: false, planKey: 'AGENCY',
  },
];

const faqs = [
  { q: 'Do I need a verified Google Business Profile?', a: 'Yes, you need a verified GMB profile. However, you can start testing with our Sandbox Mode instantly — no Google account connection needed.' },
  { q: 'How does the AI generate review replies?', a: "We use Google's Gemini AI model. It reads the reviewer's tone and your business type to craft perfectly tailored, human-sounding responses every time." },
  { q: 'Will Google penalize AI-written replies?', a: 'No. Google has no policy against AI-assisted replies. Every reply is reviewed and published by you — it always looks and feels human.' },
  { q: 'How quickly will my Google Maps ranking improve?', a: 'Most businesses see measurable improvement in 3–6 weeks of consistent posting and responding to reviews with our tool.' },
  { q: 'Is my Google account data safe?', a: 'Absolutely. We use Google OAuth 2.0 (same as "Sign in with Google"). We never see or store your password. All tokens are encrypted.' },
  { q: 'Does it work for restaurants, salons, clinics, and shops?', a: 'Yes! BizLocalPilot AI is designed for all types of local businesses — restaurants, salons, clinics, pharmacies, retailers, gyms, and more. The AI adapts to your business category automatically.' },
  { q: 'Can I manage multiple locations?', a: 'Yes. The Growth plan supports up to 3 locations and the Agency plan supports unlimited locations. Each location gets its own AI-powered dashboard.' },
  { q: 'What languages does the AI support for replies?', a: 'The AI supports English, Hindi, Marathi, Tamil, Telugu, Kannada, Gujarati, and more. It detects the reviewer\'s language and replies accordingly.' },
];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
      <div className={className}>{children}</div>
    </motion.div>
  );
}

function StatBox({ value, suffix, label, color, decimals = 0 }: { value: number; suffix: string; label: string; color: string; decimals?: number }) {
  const { ref, inView } = useCountInView({ triggerOnce: true });
  return (
    <div ref={ref} className="text-center py-6 px-4">
      <div className="text-4xl sm:text-5xl font-black mb-1" style={{ color }}>
        {inView ? <CountUp end={value} duration={2.4} decimals={decimals} suffix={suffix} /> : `0${suffix}`}
      </div>
      <p className="text-sm text-gray-500 font-semibold">{label}</p>
    </div>
  );
}

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div variants={fadeUp} custom={index} className="border border-gray-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-gray-800 hover:bg-gray-50 transition-colors gap-4 text-sm sm:text-base"
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
        id={`faq-question-${index}`}>
        <span>{q}</span>
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.22 }} aria-hidden="true">
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="overflow-hidden">
            <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TestimonialCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3200, stopOnInteraction: false })]);
  return (
    <div className="overflow-hidden" ref={emblaRef} role="region" aria-label="Customer testimonials carousel">
      <div className="flex gap-5 touch-pan-y">
        {[...testimonials, ...testimonials].map((t, i) => (
          <article key={i} className="flex-none w-[300px] sm:w-[360px]" itemScope itemType="https://schema.org/Review">
            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
              className="h-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex mb-3" aria-label={`${t.rating} star rating`}>
                {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic" itemProp="reviewBody">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 text-white"
                  style={{ background: t.color }} aria-hidden="true">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <span itemProp="name">{t.name}</span>
                  </p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </article>
        ))}
      </div>
    </div>
  );
}

// ─── STRUCTURED DATA (client-side injection for dynamic schemas) ──────────────
const testimonialsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'BizLocalPilot AI Customer Reviews',
  itemListElement: testimonials.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: t.text,
      author: { '@type': 'Person', name: t.name },
      itemReviewed: { '@type': 'SoftwareApplication', name: 'BizLocalPilot AI' },
    },
  })),
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPageClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.97)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)']);

  // Inject testimonials structured data client-side
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(testimonialsSchema);
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── NAV ── */}
      <motion.header style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm"
        role="banner">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" aria-label="Main navigation">
          <Link href="/landing" className="flex items-center gap-2.5" aria-label="BizLocalPilot AI Home">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-200" aria-hidden="true">
              <Rocket className="h-4 w-4 text-white" />
            </div>
            <span className="font-extrabold text-lg text-gray-900 tracking-tight">BizLocalPilot <span className="text-violet-600 font-black">AI</span></span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            {[
              { id: 'features', label: 'Features' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'testimonials', label: 'Reviews' },
              { id: 'faq', label: 'FAQ' },
            ].map(({ id, label }) => (
              <a key={id} href={`#${id}`}
                className="hover:text-violet-600 transition-colors relative after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-0 after:bg-violet-500 after:transition-all hover:after:w-full">
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-violet-600 transition-colors px-3 py-2">Sign In</Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/login"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-200">
                Start Free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden">
              <div className="px-4 py-4 space-y-3">
                {[
                  { id: 'features', label: 'Features' },
                  { id: 'pricing', label: 'Pricing' },
                  { id: 'testimonials', label: 'Reviews' },
                  { id: 'faq', label: 'FAQ' },
                ].map(({ id, label }) => (
                  <a key={id} href={`#${id}`} onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-semibold text-gray-600 hover:text-violet-600">
                    {label}
                  </a>
                ))}
                <Link href="/login" className="block py-2.5 px-4 bg-violet-600 text-white font-bold text-sm rounded-xl text-center">
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <main className="pt-16" id="main-content">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-sky-50 py-20 sm:py-28"
          aria-labelledby="hero-headline">
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-100 rounded-full blur-[80px] opacity-60 pointer-events-none" aria-hidden="true" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] bg-sky-100 rounded-full blur-[80px] opacity-60 pointer-events-none" aria-hidden="true" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full mb-6 border border-violet-200">
                  <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    <Rocket className="h-3.5 w-3.5 text-violet-600" aria-hidden="true" />
                  </motion.div>
                  Powered by Google Gemini AI + Business Profile API
                </motion.div>

                <motion.h1 id="hero-headline"
                  initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] text-gray-900 mb-6">
                  Rank Higher on{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                      Google Maps
                    </span>
                    <motion.div className="absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.9, duration: 0.7 }} aria-hidden="true" />
                  </span>
                  {' '}with AI on Autopilot
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                  Auto-reply to Google reviews, schedule GMB posts, get SEO audits, and track competitors —
                  all powered by <strong className="text-gray-700">Google Gemini AI</strong>. Built for restaurants, salons, clinics &amp; shops across India.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 mb-8">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link href="/login"
                      className="flex items-center justify-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-xl shadow-violet-200 text-base"
                      aria-label="Start using BizLocalPilot AI for free — no credit card required">
                      Start Free — No Credit Card
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </motion.div>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                    <Link href="/login"
                      className="flex items-center justify-center gap-2 px-7 py-3.5 bg-white border-2 border-gray-200 hover:border-violet-300 text-gray-700 hover:text-violet-600 font-bold rounded-xl transition-all text-base">
                      View Live Demo
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className="flex flex-wrap gap-5 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <div className="flex" aria-label="4.9 out of 5 stars">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />)}
                    </div>
                    <strong className="text-gray-700">4.9/5</strong> · 120+ businesses
                  </span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" /><strong className="text-gray-600">Free plan forever</strong></span>
                  <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-blue-500" aria-hidden="true" /><strong className="text-gray-600">No password stored</strong></span>
                </motion.div>
              </div>

              {/* Hero visual */}
              <motion.div initial={{ opacity: 0, x: 40, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-100 border border-gray-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-8 text-center min-h-[320px] flex flex-col items-center justify-center gap-6">
                  {/* Dashboard preview mockup */}
                  <div className="w-full max-w-sm">
                    <div className="bg-white rounded-xl shadow-md p-4 mb-3 text-left border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-800">New Review — ⭐⭐⭐⭐⭐</p>
                          <p className="text-xs text-gray-400">Rajesh K. · 2 mins ago</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 italic">"Best restaurant in Mumbai! Amazing food and service."</p>
                      <div className="mt-3 p-2 bg-violet-50 rounded-lg border border-violet-100">
                        <p className="text-xs text-violet-700 font-semibold">✨ AI Reply Ready:</p>
                        <p className="text-xs text-gray-600 mt-1">Thank you so much, Rajesh! We're thrilled you enjoyed your experience. We look forward to welcoming you back soon! 🙏</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                        <p className="text-2xl font-black text-green-500">↑ #2</p>
                        <p className="text-xs text-gray-400 font-semibold">Maps Rank</p>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 text-center">
                        <p className="text-2xl font-black text-violet-600">87</p>
                        <p className="text-xs text-gray-400 font-semibold">SEO Score</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
                  aria-hidden="true">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">Maps Ranking</p>
                    <p className="text-sm font-black text-green-600">+40% This Month</p>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-2"
                  aria-hidden="true">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">New Review</p>
                    <p className="text-sm font-black text-gray-800">5 ⭐ · AI replied</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="bg-white border-y border-gray-100" aria-label="Impact statistics">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
              {stats.map(s => <StatBox key={s.label} {...s} />)}
            </div>
          </div>
        </section>

        {/* ── PROBLEM BRIDGE ── */}
        <section className="bg-gradient-to-r from-violet-600 to-indigo-600 py-16" aria-label="Why local businesses lose customers on Google">
          <Section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.h2 variants={fadeUp} className="text-2xl sm:text-4xl font-black text-white mb-4">
              80% of customers read Google reviews before visiting a local business.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-violet-100 text-lg max-w-2xl mx-auto mb-6 leading-relaxed">
              But most shop owners don't have time to reply, post regularly, or optimize their profile.
              That's why your competitor ranks above you — even when your service is better.
            </motion.p>
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 bg-white/15 border border-white/30 text-white font-bold px-5 py-2.5 rounded-full text-base">
              <Zap className="h-5 w-5 text-yellow-300" aria-hidden="true" />
              BizLocalPilot AI fixes this automatically
            </motion.div>
          </Section>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 bg-white" aria-labelledby="features-heading">
          <Section className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Everything You Need</span>
              <h2 id="features-heading" className="text-3xl sm:text-5xl font-black text-gray-900 mb-4">One Dashboard. Total Google Business Profile Control.</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Every tool your local business needs to dominate Google Maps and rank #1 in your city.</p>
            </motion.div>

            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
              {features.map((f, i) => (
                <motion.li key={f.title} variants={fadeUp} custom={i}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 cursor-default shadow-sm hover:border-violet-100 transition-colors">
                  <div className="inline-flex p-3 rounded-xl mb-4" style={{ backgroundColor: f.bg }}>
                    <f.icon className="h-6 w-6" style={{ color: f.color }} aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                </motion.li>
              ))}
            </ul>
          </Section>
        </section>

        {/* ── FEATURE DEEP DIVE – REVIEWS ── */}
        <section className="py-24 bg-gray-50" aria-labelledby="review-feature-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={fadeUp}>
                <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Feature Spotlight</span>
                <h2 id="review-feature-heading" className="text-3xl sm:text-4xl font-black text-gray-900 mb-5">Reply to Every Google Review in Seconds with AI</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                  Gemini AI reads the customer's review, understands the sentiment, and writes a
                  perfect response tailored to your business type. Just approve and publish directly to Google.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Choose from 5 AI tone styles — Professional, Friendly, Luxury, Healthcare, Restaurant', 'Edit and customize before publishing to Google', 'Works for 1-star and 5-star reviews with equal quality', 'Average AI response generation: under 3 seconds', 'Supports Hindi, Tamil, Telugu, Kannada & more'].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-200">
                    Try AI Reply Generator <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1}
                className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-6">
                {/* Reviews mockup */}
                <div className="space-y-3">
                  {[
                    { stars: 5, name: 'Priya M.', review: 'Amazing food, loved the ambiance!', reply: 'Thank you Priya! We loved having you. Please visit us again! 🙏' },
                    { stars: 2, name: 'Rahul S.', review: 'Wait time was too long.', reply: 'We sincerely apologize, Rahul. We are actively improving our service speed. Your feedback is invaluable. 🙏' },
                  ].map((r, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">{[...Array(r.stars)].map((_, s) => <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                        <span className="text-xs font-bold text-gray-700">{r.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 italic mb-2">"{r.review}"</p>
                      <div className="bg-violet-50 rounded-lg p-2 border border-violet-100">
                        <p className="text-xs text-violet-600 font-bold mb-1">✨ AI Reply:</p>
                        <p className="text-xs text-gray-600">{r.reply}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── FEATURE DEEP DIVE – SEO ── */}
        <section className="py-24 bg-white" aria-labelledby="seo-feature-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={fadeUp} custom={1} className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                {/* SEO score mockup */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 border-4 border-green-200 mb-2">
                    <div>
                      <p className="text-3xl font-black text-green-600">87</p>
                      <p className="text-xs text-green-500 font-bold">/100</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-700">SEO Health Score</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Review Response Rate', score: 92, color: '#16a34a' },
                    { label: 'Keywords Optimized', score: 74, color: '#0284c7' },
                    { label: 'Post Frequency', score: 85, color: '#7c3aed' },
                    { label: 'Profile Completeness', score: 96, color: '#d97706' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-600">{s.label}</span>
                        <span className="font-bold" style={{ color: s.color }}>{s.score}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <motion.div variants={fadeUp} className="order-1 lg:order-2">
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest block mb-3">AI SEO Auditor</span>
                <h2 id="seo-feature-heading" className="text-3xl sm:text-4xl font-black text-gray-900 mb-5">Know Exactly Why You're Not Ranking #1 on Google Maps</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                  Our AI scores your Google Business Profile out of 100 and tells you exactly what to fix —
                  from missing keywords to photo count to review response rate.
                </p>
                <ul className="space-y-3 mb-8">
                  {["0–100 SEO health score with detailed grade breakdown", "5+ local keywords you're missing from your profile", "Step-by-step profile improvement checklist", "Competitor advantage gap analysis", "Weekly re-audits to track your progress"].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-200">
                    Audit My Profile Now <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </motion.div>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── LOCAL BUSINESS TRUST SECTION ── */}
        <section className="py-24 bg-gradient-to-br from-amber-50 to-orange-50" aria-labelledby="india-section-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={fadeUp}>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-3">Built for India</span>
                <h2 id="india-section-heading" className="text-3xl sm:text-4xl font-black text-gray-900 mb-5">
                  Made for Kirana Shops, Salons, Clinics &amp; Every Local Business Across India
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                  Whether you run a restaurant in Mumbai, a salon in Bangalore, a medical clinic in Chennai,
                  or a pharmacy in Hyderabad — BizLocalPilot AI helps you show up when customers search locally.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: MapPin, label: 'Google Maps Ranking', color: '#dc2626' },
                    { icon: Star, label: 'Review Management', color: '#d97706' },
                    { icon: Phone, label: 'More Customer Calls', color: '#16a34a' },
                    { icon: Globe, label: 'Your Own Store Page', color: '#7c3aed' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2.5 bg-white rounded-xl p-3 shadow-sm border border-white">
                      <item.icon className="h-5 w-5 flex-shrink-0" style={{ color: item.color }} aria-hidden="true" />
                      <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-200">
                    Start Growing Your Business <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1}
                className="rounded-2xl overflow-hidden shadow-2xl shadow-orange-100 bg-gradient-to-br from-orange-100 to-amber-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
                <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                  {['🍕 Restaurant', '💈 Salon', '🏥 Clinic', '💊 Pharmacy', '🛍️ Retail', '🏋️ Gym', '🎓 Coaching', '🔧 Repairs', '🏨 Hotel'].map(biz => (
                    <div key={biz} className="bg-white rounded-xl p-2 text-center shadow-sm border border-orange-100">
                      <p className="text-xs font-bold text-gray-700">{biz}</p>
                    </div>
                  ))}
                </div>
                <p className="text-center text-sm font-bold text-orange-800 mt-4">AI adapts to your business type automatically</p>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="py-24 bg-white overflow-hidden" aria-labelledby="testimonials-heading">
          <Section className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Real Results</span>
              <h2 id="testimonials-heading" className="text-3xl sm:text-5xl font-black text-gray-900 mb-3">Loved by Business Owners Across India</h2>
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" aria-hidden="true" />)}
                <span className="ml-2 text-gray-400 text-sm">4.9 / 5 from 120+ businesses</span>
              </div>
            </motion.div>
          </Section>
          <div className="pl-4 sm:pl-8">
            <TestimonialCarousel />
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 bg-gray-50" aria-labelledby="how-it-works-heading">
          <Section className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Simple Setup</span>
              <h2 id="how-it-works-heading" className="text-3xl sm:text-5xl font-black text-gray-900">Up &amp; Running in 3 Minutes</h2>
            </motion.div>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[calc(33%-1rem)] right-[calc(33%-1rem)] h-[2px] bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200" aria-hidden="true" />
              {[
                { step: '1', icon: Globe, title: 'Connect Google Business', desc: 'Sign in with Gmail and link your Google Business Profile. Takes 60 seconds. No technical skills needed.', color: '#7c3aed', bg: '#f5f3ff' },
                { step: '2', icon: Sparkles, title: 'AI Analyses Your Profile', desc: 'Gemini AI scans your reviews, profile data, and competitors instantly. You get an SEO score and action plan.', color: '#0284c7', bg: '#f0f9ff' },
                { step: '3', icon: TrendingUp, title: 'Rank Higher &amp; Grow', desc: 'Approve AI replies, publish posts, watch your Google Maps ranking climb week over week.', color: '#16a34a', bg: '#f0fdf4' },
              ].map((item, i) => (
                <motion.li key={item.step} variants={fadeUp} custom={i} className="text-center relative list-none">
                  <div className="inline-flex w-12 h-12 rounded-full text-white font-black text-lg items-center justify-center mb-4 shadow-lg"
                    style={{ background: item.color }} aria-label={`Step ${item.step}`}>
                    {item.step}
                  </div>
                  <motion.div whileHover={{ scale: 1.08, rotate: 5 }} className="inline-flex p-4 rounded-2xl mb-4" style={{ backgroundColor: item.bg }}>
                    <item.icon className="h-7 w-7" style={{ color: item.color }} aria-hidden="true" />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2" dangerouslySetInnerHTML={{ __html: item.title }} />
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.li>
              ))}
            </ol>
          </Section>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-24 bg-white" aria-labelledby="pricing-heading">
          <Section className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Simple Pricing</span>
              <h2 id="pricing-heading" className="text-3xl sm:text-5xl font-black text-gray-900 mb-4">Plans for Every Business Size</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">Start free forever. Upgrade only when you're ready to publish directly to Google.</p>
            </motion.div>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch" role="list">
              {pricingPlans.map((plan, i) => (
                <motion.li key={plan.name} variants={fadeUp} custom={i}
                  whileHover={{ y: -8, boxShadow: plan.highlight ? '0 30px 60px rgba(124,58,237,0.2)' : '0 20px 40px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className={`relative flex flex-col rounded-3xl p-7 list-none ${plan.highlight
                    ? 'bg-violet-600 text-white shadow-2xl shadow-violet-200'
                    : 'bg-white border border-gray-200 shadow-sm'
                    }`}
                  itemScope itemType="https://schema.org/Offer">
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-amber-400 text-amber-900 text-xs font-black rounded-full shadow">{plan.badge}</span>
                    </div>
                  )}
                  <h3 className={`text-xl font-black mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`} itemProp="name">{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-violet-200' : 'text-gray-400'}`}>{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`} itemProp="price">{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-violet-200' : 'text-gray-400'}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.highlight ? 'text-violet-100' : 'text-gray-600'}`}>
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 mt-0.5 ${plan.highlight ? 'text-violet-200' : 'text-green-500'}`} aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/login"
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${plan.highlight
                        ? 'bg-white text-violet-700 hover:bg-violet-50 shadow-lg'
                        : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-100'
                        }`}
                      aria-label={`${plan.cta} — ${plan.name} plan at ${plan.price}${plan.period}`}>
                      {plan.cta} <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </motion.div>
                </motion.li>
              ))}
            </ul>
          </Section>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24 bg-gray-50" aria-labelledby="faq-heading">
          <Section className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">FAQ</span>
              <h2 id="faq-heading" className="text-3xl sm:text-5xl font-black text-gray-900">Common Questions About BizLocalPilot AI</h2>
            </motion.div>
            <div className="space-y-3">
              {faqs.map((f, i) => <FAQItem key={f.q} {...f} index={i} />)}
            </div>
          </Section>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-white" aria-label="Call to action — start growing your business">
          <Section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={fadeUp}
              className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl px-8 py-16 shadow-2xl shadow-violet-200">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                <Sparkles className="h-12 w-12 text-white mx-auto mb-4" aria-hidden="true" />
              </motion.div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Start Growing on Google Today — Free</h2>
              <p className="text-violet-100 text-lg max-w-xl mx-auto mb-8">
                Join 120+ local businesses using AI to rank higher on Google Maps, respond faster to reviews, and grow smarter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-700 font-bold text-lg rounded-2xl hover:bg-violet-50 transition-colors shadow-xl">
                    Get Started Free <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-lg rounded-2xl transition-all">
                    Enter Sandbox Demo
                  </Link>
                </motion.div>
              </div>
              <p className="text-violet-300 text-xs mt-4">No credit card required. No Google password stored. Free plan forever.</p>
            </motion.div>
          </Section>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 pt-16 pb-6" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Top grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

            {/* Brand column spans 2 */}
            <div className="lg:col-span-2" itemScope itemType="https://schema.org/Organization">
              <Link href="/landing" className="inline-flex items-center gap-2.5 mb-4 group" aria-label="BizLocalPilot AI Home">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-900/40 group-hover:scale-105 transition-transform" aria-hidden="true">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <span className="font-extrabold text-xl text-white tracking-tight" itemProp="name">
                  BizLocalPilot <span className="text-violet-400 font-black">AI</span>
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs" itemProp="description">
                India&apos;s #1 AI-powered Google Business Profile optimizer. Rank higher on Google Maps, reply to reviews, and grow your local business — on autopilot.
              </p>
              <a
                href="https://wa.me/918264171623?text=Hi%2C%20I%20want%20to%20know%20more%20about%20BizLocalPilot%20AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-lg"
                style={{ background: '#25D366' }}
                aria-label="Chat with us on WhatsApp"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                WhatsApp Us
              </a>
              <meta itemProp="url" content="https://bizlocalpilot.ai" />
              <meta itemProp="telephone" content="+918264171623" />
            </div>

            {/* Product */}
            <nav aria-label="Product links">
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Product</p>
              <ul className="space-y-3 text-sm text-gray-400">
                {[
                  { label: 'AI Review Replies', href: '#features' },
                  { label: 'GMB Post Scheduler', href: '#features' },
                  { label: 'SEO Auditor', href: '#features' },
                  { label: 'Competitor Tracker', href: '#features' },
                  { label: 'Weekly Reports', href: '#features' },
                  { label: 'Public Store Pages', href: '#features' },
                ].map(link => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-violet-400 transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Company */}
            <nav aria-label="Company links">
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Company</p>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#pricing" className="hover:text-violet-400 transition-colors">Pricing</a></li>
                <li><a href="#testimonials" className="hover:text-violet-400 transition-colors">Reviews</a></li>
                <li><a href="#faq" className="hover:text-violet-400 transition-colors">FAQ</a></li>
                <li><Link href="/login" className="hover:text-violet-400 transition-colors">Dashboard Login</Link></li>
                <li><Link href="/privacy" className="hover:text-violet-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-violet-400 transition-colors">Terms of Service</Link></li>
                <li>
                  <a href="https://codecrafters.co.in" target="_blank" rel="noopener noreferrer"
                    className="hover:text-violet-400 transition-colors">CodeCrafters.co.in</a>
                </li>
              </ul>
            </nav>

            {/* Contact */}
            <div itemScope itemType="https://schema.org/Organization">
              <p className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Contact</p>
              <ul className="space-y-4 text-sm text-gray-400">

                {/* Address */}
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <address className="not-italic leading-relaxed" itemProp="address">
                    Guruprupa, Jawahar Nagar Road-4,<br />
                    Goregaon West, Mumbai — 400104,<br />
                    Maharashtra, India &#x1F1EE;&#x1F1F3;
                  </address>
                </li>

                {/* Email */}
                <li className="flex items-start gap-2.5">
                  <svg className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:hello@codecrafters.co.in" itemProp="email"
                    className="hover:text-violet-400 transition-colors break-all">
                    hello@codecrafters.co.in
                  </a>
                </li>

                {/* Phone */}
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-violet-400 flex-shrink-0" aria-hidden="true" />
                  <a href="tel:+918264171623" itemProp="telephone"
                    className="hover:text-violet-400 transition-colors font-semibold">
                    +91 82641 71623
                  </a>
                </li>

                {/* WhatsApp */}
                <li className="flex items-center gap-2.5">
                  <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  <a href="https://wa.me/918264171623" target="_blank" rel="noopener noreferrer"
                    className="transition-colors font-semibold" style={{ color: '#25D366' }}>
                    WhatsApp: +91 82641 71623
                  </a>
                </li>

              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <div className="flex flex-col sm:flex-row items-center gap-2 text-center">
                <span>&#169; {new Date().getFullYear()} BizLocalPilot AI &middot; All rights reserved.</span>
                <span className="hidden sm:inline">&middot;</span>
                <span>Made with &#10084;&#65039; in India &#x1F1EE;&#x1F1F3;</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
                <a href="https://bizlocalpilot.ai/sitemap.xml" className="hover:text-gray-400 transition-colors">Sitemap</a>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Powered by</span>
                <a href="https://codecrafters.co.in" target="_blank" rel="noopener noreferrer"
                  className="font-bold text-violet-500 hover:text-violet-400 transition-colors">
                  CodeCrafters.co.in
                </a>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
