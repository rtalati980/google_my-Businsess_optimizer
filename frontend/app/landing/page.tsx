'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView as useCountInView } from 'react-intersection-observer';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import {
  Sparkles, Star, MessageSquare, Megaphone, TrendingUp,
  BarChart2, Shield, CheckCircle2, ArrowRight, Globe,
  ChevronRight, Zap, MapPin, Phone, Menu, X
} from 'lucide-react';

// ─── VARIANTS ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.09, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

// ─── DATA ─────────────────────────────────────────────────────────────────────
const features = [
  { icon: MessageSquare, color: '#7c3aed', bg: '#f5f3ff', title: 'AI Review Replies', description: 'Claude AI instantly writes perfect, tone-matched responses to every customer review — Professional, Friendly, Thankful, and more.' },
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
    name: 'Starter', price: '₹499', period: '/month', description: 'For single-location shops',
    features: ['1 Location', 'AI Review Replies', '5 Scheduled Posts/mo', 'Basic SEO Score', 'Email Support'],
    cta: 'Start Free Trial', highlight: false,
  },
  {
    name: 'Growth', price: '₹1,499', period: '/month', description: 'Best for growing brands', badge: '⭐ Most Popular',
    features: ['3 Locations', 'Unlimited AI Replies', 'Unlimited Posts', 'Full SEO Auditor', 'Competitor Tracker', 'Public Store Pages', 'Priority Support'],
    cta: 'Get Started Now', highlight: true,
  },
  {
    name: 'Agency', price: '₹3,999', period: '/month', description: 'For agencies & franchises',
    features: ['Unlimited Locations', 'White-label Dashboard', 'All Growth Features', 'Bulk Reports Export', 'Dedicated Manager', 'Custom API Access'],
    cta: 'Contact Sales', highlight: false,
  },
];

const faqs = [
  { q: 'Do I need a verified Google Business Profile?', a: 'Yes, you need a verified GMB profile. However, you can start testing with our Sandbox Mode instantly — no Google account connection needed.' },
  { q: 'How does the AI generate review replies?', a: "We use Anthropic's Claude AI model. It reads the reviewer's tone and your business type to craft perfectly tailored, human-sounding responses every time." },
  { q: 'Will Google penalize AI-written replies?', a: 'No. Google has no policy against AI-assisted replies. Every reply is reviewed and published by you — it always looks and feels human.' },
  { q: 'How quickly will my Google Maps ranking improve?', a: 'Most businesses see measurable improvement in 3–6 weeks of consistent posting and responding to reviews with our tool.' },
  { q: 'Is my Google account data safe?', a: 'Absolutely. We use Google OAuth 2.0 (same as "Sign in with Google"). We never see or store your password. All tokens are encrypted.' },
];

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger} className={className}>
      {children}
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
        className="w-full flex items-center justify-between px-6 py-5 text-left font-bold text-gray-800 hover:bg-gray-50 transition-colors gap-4 text-sm sm:text-base">
        {q}
        <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.22 }}>
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: 'easeInOut' }} className="overflow-hidden">
            <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function TestimonialCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3200, stopOnInteraction: false })]);
  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex gap-5 touch-pan-y">
        {[...testimonials, ...testimonials].map((t, i) => (
          <div key={i} className="flex-none w-[300px] sm:w-[360px]">
            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
              className="h-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 text-white"
                  style={{ background: t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,255,255,0)', 'rgba(255,255,255,0.95)']);
  const navBorder = useTransform(scrollY, [0, 80], ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)']);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: "'Inter', 'Outfit', system-ui, sans-serif" }}>

      {/* ── NAV ── */}
      <motion.header style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-lg text-gray-900">GMB AI Manager</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-500">
            {['features', 'pricing', 'testimonials', 'faq'].map(id => (
              <a key={id} href={`#${id}`}
                className="hover:text-violet-600 transition-colors capitalize relative after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-0 after:bg-violet-500 after:transition-all hover:after:w-full">
                {id}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-violet-600 transition-colors px-3 py-2">Sign In</Link>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/login"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-violet-200">
                Get Started Free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
            <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
                {['features', 'pricing', 'testimonials', 'faq'].map(id => (
                  <a key={id} href={`#${id}`} onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-semibold text-gray-600 hover:text-violet-600 capitalize">
                    {id}
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

      <main className="pt-16">
        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-50 via-white to-sky-50 py-20 sm:py-28">
          {/* Decorative blobs */}
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-violet-100 rounded-full blur-[80px] opacity-60 pointer-events-none" />
          <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] bg-sky-100 rounded-full blur-[80px] opacity-60 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Text */}
              <div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 text-xs font-bold rounded-full mb-6 border border-violet-200">
                  <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    <Sparkles className="h-3.5 w-3.5" />
                  </motion.div>
                  Powered by Claude AI + Google Business Profile API
                </motion.div>

                <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] text-gray-900 mb-6">
                  Rank Higher on{' '}
                  <span className="relative inline-block">
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent">
                      Google Maps
                    </span>
                    <motion.div className="absolute -bottom-1 left-0 h-[3px] bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ delay: 0.9, duration: 0.7 }} />
                  </span>
                  <br />with AI on Autopilot
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
                  className="text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                  Auto-reply to reviews, schedule GMB posts, get SEO audits, and track competitors —
                  all powered by <strong className="text-gray-700">Claude AI</strong>. Built for local shops, restaurants, clinics & salons across India.
                </motion.p>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-3 mb-8">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link href="/login"
                      className="flex items-center justify-center gap-2 px-7 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-xl shadow-violet-200 text-base">
                      Start Free — No Credit Card
                      <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                        <ArrowRight className="h-4 w-4" />
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
                    <div className="flex">{[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
                    <strong className="text-gray-700">4.9/5</strong> · 120+ businesses
                  </span>
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-green-500" /><strong className="text-gray-600">14-day free trial</strong></span>
                  <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-blue-500" /><strong className="text-gray-600">No password stored</strong></span>
                </motion.div>
              </div>

              {/* Hero image */}
              <motion.div initial={{ opacity: 0, x: 40, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-violet-100 border border-gray-100">
                  <Image src="/hero-dashboard.png" alt="GMB AI Manager Dashboard — AI review replies and SEO score"
                    width={680} height={430} className="w-full h-auto" priority />
                </div>
                {/* Floating badge */}
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">Maps Ranking</p>
                    <p className="text-sm font-black text-green-600">+40% This Month</p>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-2">
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
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-100">
              {stats.map(s => <StatBox key={s.label} {...s} />)}
            </div>
          </div>
        </section>

        {/* ── PROBLEM BRIDGE ── */}
        <section className="bg-gradient-to-r from-violet-600 to-indigo-600 py-16">
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
              <Zap className="h-5 w-5 text-yellow-300" />
              GMB AI Manager fixes this automatically
            </motion.div>
          </Section>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 bg-white">
          <Section className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Everything You Need</span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4">One Dashboard. Total GMB Control.</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Every tool your local business needs to dominate Google Maps.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <motion.div key={f.title} variants={fadeUp} custom={i}
                  whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 250, damping: 22 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 cursor-default shadow-sm hover:border-violet-100 transition-colors">
                  <div className="inline-flex p-3 rounded-xl mb-4" style={{ backgroundColor: f.bg }}>
                    <f.icon className="h-6 w-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── FEATURE DEEP DIVE – REVIEWS ── */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={fadeUp}>
                <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Feature Spotlight</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5">Reply to Every Review in Seconds</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                  Claude AI reads the customer's review, understands the sentiment, and writes a
                  perfect response tailored to your business type. Just approve and publish.
                </p>
                <ul className="space-y-3 mb-8">
                  {['Choose from 5 AI tone styles', 'Edit and customize before publishing', 'Works for 1-star and 5-star reviews', 'Average response time: under 3 seconds'].map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-violet-200">
                    Try AI Reply Generator <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1}
                className="rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100">
                <Image src="/feature-reviews.png" alt="AI review reply generation tool showing Google review with AI-written response"
                  width={600} height={400} className="w-full h-auto" />
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── FEATURE DEEP DIVE – SEO ── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={fadeUp} custom={1} className="order-2 lg:order-1 rounded-2xl overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100">
                <Image src="/feature-seo.png" alt="AI SEO Auditor showing score dial, keyword suggestions and profile improvements"
                  width={600} height={400} className="w-full h-auto" />
              </motion.div>
              <motion.div variants={fadeUp} className="order-1 lg:order-2">
                <span className="text-xs font-bold text-green-600 uppercase tracking-widest block mb-3">AI SEO Auditor</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5">Know Exactly Why You're Not Ranking #1</h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                  Our AI scores your Google Business Profile out of 100 and tells you exactly what to fix —
                  from missing keywords to photo count to review response rate.
                </p>
                <ul className="space-y-3 mb-8">
                  {["0–100 SEO health score with grade", "5 local keywords you're missing", "Step-by-step profile improvements", "Competitor advantage analysis"].map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-200">
                    Audit My Profile Now <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── LOCAL BUSINESS TRUST SECTION ── */}
        <section className="py-24 bg-gradient-to-br from-amber-50 to-orange-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <Section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={fadeUp}>
                <span className="text-xs font-bold text-orange-600 uppercase tracking-widest block mb-3">Built for India</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-5">
                  Made for Kirana Shops, Salons, Clinics & Every Local Business
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed mb-6">
                  Whether you run a restaurant in Mumbai, a salon in Bangalore, or a medical clinic in Chennai —
                  GMB AI Manager helps you show up when customers search for you locally.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: MapPin, label: 'Google Maps Ranking', color: '#dc2626' },
                    { icon: Star, label: 'Review Management', color: '#d97706' },
                    { icon: Phone, label: 'More Customer Calls', color: '#16a34a' },
                    { icon: Globe, label: 'Your Own Store Page', color: '#7c3aed' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2.5 bg-white rounded-xl p-3 shadow-sm border border-white">
                      <item.icon className="h-5 w-5 flex-shrink-0" style={{ color: item.color }} />
                      <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-200">
                    Start Growing Your Business <ArrowRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeUp} custom={1} className="rounded-2xl overflow-hidden shadow-2xl shadow-orange-100">
                <Image src="/local-shop.png" alt="Happy Indian local business owner checking Google Maps 5-star rating on phone"
                  width={600} height={450} className="w-full h-auto" />
              </motion.div>
            </Section>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="py-24 bg-white overflow-hidden">
          <Section className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Real Results</span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-3">Loved by Business Owners Across India</h2>
              <div className="flex items-center justify-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />)}
                <span className="ml-2 text-gray-400 text-sm">4.9 / 5 from 120+ businesses</span>
              </div>
            </motion.div>
          </Section>
          <div className="pl-4 sm:pl-8">
            <TestimonialCarousel />
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 bg-gray-50">
          <Section className="max-w-5xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Simple Setup</span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900">Up & Running in 3 Minutes</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-[calc(33%-1rem)] right-[calc(33%-1rem)] h-[2px] bg-gradient-to-r from-violet-200 via-violet-400 to-violet-200" />
              {[
                { step: '1', icon: Globe, title: 'Connect Google', desc: 'Sign in with Gmail and link your Google Business Profile. Takes 60 seconds.', color: '#7c3aed', bg: '#f5f3ff' },
                { step: '2', icon: Sparkles, title: 'AI Analyses Profile', desc: 'Claude scans your reviews, profile data, and competitors instantly.', color: '#0284c7', bg: '#f0f9ff' },
                { step: '3', icon: TrendingUp, title: 'Rank & Grow', desc: 'Approve AI replies, publish posts, watch your Maps ranking climb.', color: '#16a34a', bg: '#f0fdf4' },
              ].map((item, i) => (
                <motion.div key={item.step} variants={fadeUp} custom={i} className="text-center relative">
                  <div className="inline-flex w-12 h-12 rounded-full text-white font-black text-lg items-center justify-center mb-4 shadow-lg"
                    style={{ background: item.color }}>
                    {item.step}
                  </div>
                  <motion.div whileHover={{ scale: 1.08, rotate: 5 }} className="inline-flex p-4 rounded-2xl mb-4" style={{ backgroundColor: item.bg }}>
                    <item.icon className="h-7 w-7" style={{ color: item.color }} />
                  </motion.div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="py-24 bg-white">
          <Section className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-14">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">Simple Pricing</span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mb-4">Plans for Every Business Size</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">Less than a cup of chai per day. 14-day free trial on all plans. Cancel anytime.</p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {pricingPlans.map((plan, i) => (
                <motion.div key={plan.name} variants={fadeUp} custom={i}
                  whileHover={{ y: -8, boxShadow: plan.highlight ? '0 30px 60px rgba(124,58,237,0.2)' : '0 20px 40px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className={`relative flex flex-col rounded-3xl p-7 ${
                    plan.highlight
                      ? 'bg-violet-600 text-white shadow-2xl shadow-violet-200'
                      : 'bg-white border border-gray-200 shadow-sm'
                  }`}>
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 bg-amber-400 text-amber-900 text-xs font-black rounded-full shadow">{plan.badge}</span>
                    </div>
                  )}
                  <h3 className={`text-xl font-black mb-1 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-violet-200' : 'text-gray-400'}`}>{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? 'text-violet-200' : 'text-gray-400'}`}>{plan.period}</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-center gap-2.5 text-sm ${plan.highlight ? 'text-violet-100' : 'text-gray-600'}`}>
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? 'text-violet-200' : 'text-green-500'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/login"
                      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                        plan.highlight
                          ? 'bg-white text-violet-700 hover:bg-violet-50 shadow-lg'
                          : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-100'
                      }`}>
                      {plan.cta} <ChevronRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </Section>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24 bg-gray-50">
          <Section className="max-w-3xl mx-auto px-4 sm:px-6">
            <motion.div variants={fadeUp} className="text-center mb-12">
              <span className="text-xs font-bold text-violet-600 uppercase tracking-widest block mb-3">FAQ</span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900">Common Questions</h2>
            </motion.div>
            <div className="space-y-3">
              {faqs.map((f, i) => <FAQItem key={f.q} {...f} index={i} />)}
            </div>
          </Section>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-white">
          <Section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <motion.div variants={fadeUp}
              className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl px-8 py-16 shadow-2xl shadow-violet-200">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                <Sparkles className="h-12 w-12 text-white mx-auto mb-4" />
              </motion.div>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">Start Growing on Google Today</h2>
              <p className="text-violet-100 text-lg max-w-xl mx-auto mb-8">
                Join 120+ local businesses using AI to rank higher, respond faster, and grow smarter.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-violet-700 font-bold text-lg rounded-2xl hover:bg-violet-50 transition-colors shadow-xl">
                    Try Free for 14 Days <ArrowRight className="h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/login"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-lg rounded-2xl transition-all">
                    Enter Sandbox Demo
                  </Link>
                </motion.div>
              </div>
              <p className="text-violet-300 text-xs mt-4">No credit card required. No Google password stored.</p>
            </motion.div>
          </Section>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-white">GMB AI Manager</span>
              </div>
              <p className="text-gray-400 text-xs max-w-xs">Helping local Indian businesses grow on Google Maps with Claude AI.</p>
            </div>
            <div className="flex gap-8 text-sm text-gray-400">
              {['features', 'pricing', 'faq'].map(id => (
                <a key={id} href={`#${id}`} className="hover:text-white transition-colors capitalize">{id}</a>
              ))}
              <Link href="/login" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} GMB AI Manager · Made in India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
