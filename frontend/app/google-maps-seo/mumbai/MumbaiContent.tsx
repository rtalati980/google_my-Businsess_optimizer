'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Star, TrendingUp, MapPin, CheckCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface IndustryGuide {
  title: string;
  icon: string;
  content: string;
  keyPoints: string[];
}

export default function MumbaiContent() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqItems: FAQItem[] = [
    {
      question: 'How long does it take to rank #1 on Google Maps in Mumbai?',
      answer:
        'Typically 30-90 days if you follow this strategy correctly. Some businesses see results in 2 weeks, others take 6 months. It depends on your starting position, how fast you get new reviews, profile completeness, competition level in your category, and consistency of execution. Quick Win Timeline: Week 1: Usually move 5-10 positions up, Week 4: Usually in top 10, Week 8: Usually in top 5, Week 12: Should reach top 3.',
    },
    {
      question: 'How many reviews do I need to rank #1 in Mumbai?',
      answer:
        'It varies by category: Restaurants: 150-300 reviews, Salons: 200-400 reviews, Clinics: 100-250 reviews, Retail shops: 80-200 reviews. But here\'s the key: It\'s not just about total reviews, it\'s about review velocity (how many you get per month). A business with 50 reviews/month will rank higher than one with 1000 total reviews but zero recent ones.',
    },
    {
      question: 'Do I need a website or can I just use Google Business Profile?',
      answer:
        'You can rank on Google Maps without a website, BUT having a website helps because: 1) More legitimacy for customers, 2) Can rank on organic search results too, 3) Improves overall digital presence. Minimum: At least a simple 3-page website (Home, About, Contact).',
    },
    {
      question: 'How do delivery apps (Zomato, Swiggy) affect my Google Maps ranking?',
      answer:
        'Delivery app signals DO influence Google Maps ranking: Number of delivery orders, Ratings on delivery apps, How "active" you are on apps, Menu availability, Delivery speed. Best Practice: Stay active on Zomato/Swiggy + mention it in your Google profile.',
    },
    {
      question: 'Should I optimize for different Mumbai neighborhoods separately?',
      answer:
        'Yes! Create separate location pages if you have multiple locations. If you have one location, focus your service area optimization for your specific neighborhood. Example: Instead of serving "Mumbai," you focus on "Bandra, Worli, Colaba" area.',
    },
    {
      question: "What's the best time to post on Google Business Profile for Mumbai audience?",
      answer:
        '12-1 PM: Office lunch break (work crowd). 5-7 PM: Evening commute (after-work traffic). 11 AM-12 PM Weekends: Leisure browsing. Avoid: 10-11 PM onwards (most people sleep).',
    },
    {
      question: 'How do I compete with big chains on Google Maps in Mumbai?',
      answer:
        'Big chains have disadvantages: Slower to respond to reviews, Generic responses, Less personal touch, Often poorly optimized profiles. Your advantages: Personal relationships with customers, Faster response times, Local knowledge, Authentic engagement. Strategy: Use these strengths - respond faster, be more personal, highlight local roots.',
    },
    {
      question: 'Is Hindi optimization necessary for Mumbai businesses?',
      answer:
        'Hindi helps but isn\'t critical. However: Many older customers in Mumbai speak Hindi, Some search in Hindi, Mixed Hindi-English posts get better engagement, Responses in customer\'s language = higher satisfaction. Best Practice: Offer bilingual posts and review responses.',
    },
  ];

  const industryGuides: IndustryGuide[] = [
    {
      title: '🍕 Restaurants in Mumbai',
      icon: '🍕',
      content:
        'Mumbai has 8,900+ restaurants competing for visibility. The key to ranking is delivery app integration (Zomato, Swiggy dominate), consistent review collection, and high-quality food photography.',
      keyPoints: [
        'Service area optimization: List specific neighborhoods (Bandra, Worli, Colaba, Fort)',
        'Delivery integration: Mention Zomato, Swiggy availability',
        'Menu uploads: Include prices for transparency',
        'Seasonal specials: Monsoon comfort food, festival specials',
        'Peak hours setup: Important for real-time info',
        'Review collection: Every delivery should lead to Google review',
      ],
    },
    {
      title: '💈 Salons in Mumbai',
      icon: '💈',
      content:
        'Salons face extreme price competition but loyalty matters. Wedding season (Nov-Feb) is your revenue peak. Focus on before/after transformations and bridal services.',
      keyPoints: [
        'Service optimization: List all services with prices',
        'Before/After strategy: 20+ transformation photos minimum',
        'Bridal focus: Engagement, mehendi, wedding, reception makeup',
        'Team profiles: Staff certifications and specializations',
        'Monsoon tips: Frizz-fighting solutions, monsoon-specific treatments',
        'Wedding season positioning: "Limited bridal bookings available"',
      ],
    },
    {
      title: '🏥 Medical Clinics in Mumbai',
      icon: '🏥',
      content:
        'Trust is everything in healthcare. Doctor profiles, qualifications, and insurance acceptance are critical. Mumbai has high medical consultation demand.',
      keyPoints: [
        'Doctor profiles: Name, photo, qualifications, years of experience',
        'Insurance acceptance: Major ranking factor',
        'Telemedicine availability: Important post-COVID',
        'Appointment booking: Integration with systems',
        'Parking details: Crucial in Mumbai congestion',
        'Emergency services: If applicable, highlight prominently',
      ],
    },
    {
      title: '🛍️ Retail Shops in Mumbai',
      icon: '🛍️',
      content:
        'Retail in Mumbai is competitive. Online delivery, same-day service, and curbside pickup are game-changers for ranking.',
      keyPoints: [
        'Product photography: High-quality images of bestsellers',
        'Inventory signals: Show stock availability',
        'Delivery options: Own delivery or partnerships',
        'Parking information: Crucial for footfall',
        'Payment methods: Highlight modern options',
        'Special offers: Seasonal promotions',
      ],
    },
    {
      title: '🏋️ Gyms & Fitness in Mumbai',
      icon: '🏋️',
      content:
        'Fitness is growing fast in Mumbai. Before/after transformations, trainer profiles, and class schedules are essential.',
      keyPoints: [
        'Trainer profiles: Certifications and specializations',
        'Class schedules: Clearly display all options',
        'Amenities: Pool, sauna, parking, etc.',
        'Trial offers: Easy discovery for new members',
        'Equipment showcase: Professional photos',
        'Member testimonials: Strong social proof',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Complete Mumbai Guide</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Rank Higher on Google Maps in Mumbai: Complete SEO Guide for 2026
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed">
              Are you a local business owner in Mumbai struggling to rank on Google Maps? 76% of local searches
              lead to a physical visit or purchase. If you're not appearing in the top 3 Google Maps results in
              Mumbai, you're losing potential customers to competitors daily.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <Star className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">8,900+ Monthly Searches</div>
                  <p className="text-sm text-slate-600">Google Maps searches in Mumbai</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">45,000+ Competitors</div>
                  <p className="text-sm text-slate-600">Businesses competing in Mumbai</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-slate-900">100% Free Traffic</div>
                  <p className="text-sm text-slate-600">No ad spend required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Why Google Maps Matters */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Google Maps Matters for Mumbai Businesses</h2>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Mumbai Has the Highest Google Maps Search Volume in India</h3>
              <p className="text-slate-600 mb-4">
                Mumbai accounts for over 12% of all Google Maps searches in India. This makes it an extremely competitive market, but also one with massive opportunity.
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span><strong>Mumbai Google Maps searches/month:</strong> 8,900+</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span><strong>Average position value:</strong> Very high (customers in Mumbai have high spending power)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span><strong>Mobile searches dominate:</strong> 78% of searches are on mobile devices</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Mumbai's Economy Supports High Customer Value</h3>
              <p className="text-slate-600 mb-4">
                Mumbai is India's financial capital. Customers here spend more on average:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span><strong>Average customer lifetime value:</strong> ₹15,000-50,000+ per customer</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span><strong>Restaurant spend:</strong> ₹500-2000 per visit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold mt-1">•</span>
                  <span><strong>Salon spend:</strong> ₹2000-5000 per visit</span>
                </li>
              </ul>
              <p className="text-slate-600 mt-4 font-semibold">
                This means: One new customer from Google Maps could be worth ₹5,000-10,000 to your business.
              </p>
            </div>
          </div>
        </section>

        {/* Step-by-Step Guide */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Step-by-Step Google Maps Ranking Guide for Mumbai</h2>

          <div className="space-y-6">
            {/* Step 1 */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-blue-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Complete Your Mumbai Business Profile</h3>
                  <p className="text-slate-600 mb-4">
                    Google's algorithm rewards complete profiles. Incomplete profiles rank lower, no matter how many reviews you have.
                  </p>
                  <div className="space-y-3 bg-slate-50 p-4 rounded">
                    <div>
                      <p className="font-semibold text-slate-900">Business Name</p>
                      <p className="text-slate-600 text-sm">
                        Exactly as it appears on your signboard/license. Mumbai Tip: If you have multiple locations, add location identifier.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Service Areas</p>
                      <p className="text-slate-600 text-sm">
                        Add specific areas: Bandra, Worli, Colaba, Fort, South Mumbai, Andheri, Powai, Thane
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Opening Hours</p>
                      <p className="text-slate-600 text-sm">
                        Regular hours + special hours for weekends. Add holidays specific to Mumbai culture (Diwali, Holi, Ganesh Chaturthi)
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 font-semibold mt-4">
                    Expected Ranking Impact: 15-20% improvement from completing profile
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-blue-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Get Strategic Google Reviews from Mumbai Customers</h3>
                  <p className="text-slate-600 mb-4">
                    Reviews are the #1 ranking factor on Google Maps. More reviews + higher rating = higher ranking.
                  </p>
                  <div className="space-y-3 bg-slate-50 p-4 rounded">
                    <div>
                      <p className="font-semibold text-slate-900">Current Benchmarks for Mumbai</p>
                      <ul className="text-slate-600 text-sm space-y-1 mt-2">
                        <li>• Restaurants: 150+ reviews for top ranking</li>
                        <li>• Salons: 200+ reviews</li>
                        <li>• Clinics: 100+ reviews</li>
                        <li>• Shops: 80+ reviews</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Monthly Targets</p>
                      <ul className="text-slate-600 text-sm space-y-1 mt-2">
                        <li>• Month 1: 20 new reviews</li>
                        <li>• Month 2: 30 new reviews</li>
                        <li>• Month 3: 40 new reviews</li>
                        <li>• Ongoing: 20+ reviews per month</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 font-semibold mt-4">
                    Expected Ranking Impact: 30-40% improvement + every review = +0.1% ranking boost
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-blue-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Master GMB Posts for Mumbai Audience</h3>
                  <p className="text-slate-600 mb-4">
                    Posts keep your profile "active" in Google's eyes. Profiles with recent posts (within last 7 days) rank 20-30% higher.
                  </p>
                  <div className="space-y-3 bg-slate-50 p-4 rounded">
                    <div>
                      <p className="font-semibold text-slate-900">Best Times to Post in Mumbai</p>
                      <ul className="text-slate-600 text-sm space-y-1 mt-2">
                        <li>• Lunch hours: 12-1 PM (work crowd)</li>
                        <li>• Evening: 5-7 PM (commute time)</li>
                        <li>• Weekends: 11 AM-12 PM (leisure time)</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Weekly Posting Strategy</p>
                      <ul className="text-slate-600 text-sm space-y-1 mt-2">
                        <li>• 3-5 posts per week minimum</li>
                        <li>• Use local references (Bandra, Worli, neighborhoods)</li>
                        <li>• Mention delivery apps (Zomato, Swiggy)</li>
                        <li>• Include emojis (Mumbai audience loves them)</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 font-semibold mt-4">
                    Expected Ranking Impact: 20-25% improvement from consistent posting
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 hover:border-blue-300 transition">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">Optimize Your Photos for Mumbai Market</h3>
                  <p className="text-slate-600 mb-4">
                    Profiles with 15+ high-quality photos rank 30% higher than profiles with 1-2 photos.
                  </p>
                  <div className="space-y-3 bg-slate-50 p-4 rounded">
                    <div>
                      <p className="font-semibold text-slate-900">Photo Count Targets</p>
                      <ul className="text-slate-600 text-sm space-y-1 mt-2">
                        <li>• Minimum: 15 photos</li>
                        <li>• Ideal: 30-50 photos</li>
                        <li>• Top performers: 100+ photos</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Photo Quality Standards</p>
                      <ul className="text-slate-600 text-sm space-y-1 mt-2">
                        <li>• High resolution (at least 720px width)</li>
                        <li>• Well-lit (professional lighting, not flash)</li>
                        <li>• Clear focus on subject</li>
                        <li>• Natural colors (not over-filtered)</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-green-700 font-semibold mt-4">
                    Expected Ranking Impact: 25-30% improvement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industry Guides */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Industry-Specific Guides for Mumbai</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {industryGuides.map((guide, index) => (
              <div key={index} className="bg-white rounded-lg p-6 border border-slate-200 hover:border-blue-300 transition">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{guide.title}</h3>
                <p className="text-slate-600 mb-4">{guide.content}</p>
                <div className="space-y-2">
                  {guide.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-600">
                      <span className="text-blue-500 font-bold flex-shrink-0">✓</span>
                      <span className="text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions About Google Maps in Mumbai</h2>

          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <span className="font-semibold text-slate-900 text-left">{item.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 flex-shrink-0 transition ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Common Mistakes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Common Mistakes Mumbai Businesses Make on Google Maps</h2>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 mb-2">Incomplete or Poorly Written Profile</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    <strong>Bad:</strong> "Restaurant" | <strong>Good:</strong> "Premium Fine Dining Maharashtrian Restaurant in Bandra with authentic coastal cuisine, served in upscale ambiance..."
                  </p>
                  <p className="text-red-700 text-sm font-semibold">Impact: 50% ranking penalty</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 mb-2">Not Responding to Reviews</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    "Set and forget" approach vs Respond within 2-4 hours with personalized messages
                  </p>
                  <p className="text-red-700 text-sm font-semibold">Impact: Businesses that respond rank 25% higher</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 mb-2">Ignoring Service Areas</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    "Mumbai" vs "Bandra East, Worli, Colaba, Fort, South Mumbai, Andheri..."
                  </p>
                  <p className="text-red-700 text-sm font-semibold">Impact: Specific areas get local ranking boost</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 mb-2">No Review Generation Strategy</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Hoping for reviews to come naturally vs Active, systematic review collection (20+ per month)
                  </p>
                  <p className="text-red-700 text-sm font-semibold">Impact: Never reach top 3 positions</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-900 mb-2">Ignoring Delivery App Signals</h3>
                  <p className="text-slate-600 text-sm mb-3">
                    Not mentioning Zomato/Swiggy vs Active on delivery apps + mention in profile + high ratings
                  </p>
                  <p className="text-red-700 text-sm font-semibold">Impact: 40% boost from delivery integration</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Dominate Google Maps in Mumbai?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join 120+ Mumbai businesses already ranking #1 on Google Maps with BizLocalPilot AI
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">Free Forever</div>
              <p className="text-blue-100 text-sm">Start with our free plan. Upgrade only when ready.</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">AI-Powered</div>
              <p className="text-blue-100 text-sm">AI replies, auto scheduling, SEO audits all automated.</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <div className="text-3xl font-bold mb-2">No CC Required</div>
              <p className="text-blue-100 text-sm">Start free. No credit card needed to get started.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/login"
              className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition inline-block text-center"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition inline-block text-center border border-blue-400"
            >
              Get Free Audit
            </Link>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Questions? We're Here to Help
          </h3>
          <div className="space-y-2 text-slate-600">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:hello@codecrafters.co.in" className="text-blue-600 hover:underline">
                hello@codecrafters.co.in
              </a>
            </p>
            <p>
              <strong>WhatsApp:</strong>{' '}
              <a href="https://wa.me/918264171623" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                +91 82641 71623
              </a>
            </p>
          </div>
        </section>
      </div>

      {/* Schema Markup for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Rank Higher on Google Maps in Mumbai: Complete SEO Guide for 2026',
            description: 'Complete guide to ranking #1 on Google Maps in Mumbai with proven strategies for restaurants, salons, clinics, and retail shops.',
            author: {
              '@type': 'Organization',
              name: 'BizLocalPilot AI',
              url: 'https://bizlocalpilot.com',
            },
            datePublished: new Date().toISOString(),
          }),
        }}
      />
    </div>
  );
}
