import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Google Maps SEO Guides for Indian Cities - BizLocalPilot AI',
  description:
    'Complete Google Maps optimization guides for 20+ Indian cities. Learn proven strategies to rank #1 on Google Maps in your city and get more customers.',
  keywords: [
    'Google Maps SEO',
    'Local business ranking',
    'Google Business Profile optimization',
    'Cities guide',
    'India',
  ],
};

interface CityGuide {
  name: string;
  slug: string;
  region: string;
  competition: 'Very High' | 'High' | 'Medium' | 'Low';
  estimatedMonthlySearches: number;
}

export default function GoogleMapsSEOHub() {
  const cities: CityGuide[] = [
    // Tier 1: Mega Cities
    { name: 'Mumbai', slug: 'mumbai', region: 'Maharashtra', competition: 'Very High', estimatedMonthlySearches: 1200 },
    { name: 'Bangalore', slug: 'bangalore', region: 'Karnataka', competition: 'High', estimatedMonthlySearches: 980 },
    { name: 'Delhi', slug: 'delhi', region: 'Delhi', competition: 'Very High', estimatedMonthlySearches: 1100 },
    { name: 'Chennai', slug: 'chennai', region: 'Tamil Nadu', competition: 'High', estimatedMonthlySearches: 710 },
    { name: 'Hyderabad', slug: 'hyderabad', region: 'Telangana', competition: 'Medium', estimatedMonthlySearches: 650 },

    // Tier 2: Major Cities
    { name: 'Pune', slug: 'pune', region: 'Maharashtra', competition: 'Medium', estimatedMonthlySearches: 580 },
    { name: 'Kolkata', slug: 'kolkata', region: 'West Bengal', competition: 'Medium', estimatedMonthlySearches: 520 },
    { name: 'Ahmedabad', slug: 'ahmedabad', region: 'Gujarat', competition: 'Medium', estimatedMonthlySearches: 480 },
    { name: 'Jaipur', slug: 'jaipur', region: 'Rajasthan', competition: 'Medium', estimatedMonthlySearches: 420 },
    { name: 'Lucknow', slug: 'lucknow', region: 'Uttar Pradesh', competition: 'Low', estimatedMonthlySearches: 380 },

    // Tier 3: Growing Cities
    { name: 'Chandigarh', slug: 'chandigarh', region: 'Punjab', competition: 'Low', estimatedMonthlySearches: 320 },
    { name: 'Indore', slug: 'indore', region: 'Madhya Pradesh', competition: 'Low', estimatedMonthlySearches: 300 },
    { name: 'Coimbatore', slug: 'coimbatore', region: 'Tamil Nadu', competition: 'Low', estimatedMonthlySearches: 280 },
    { name: 'Surat', slug: 'surat', region: 'Gujarat', competition: 'Low', estimatedMonthlySearches: 240 },
    { name: 'Vadodara', slug: 'vadodara', region: 'Gujarat', competition: 'Low', estimatedMonthlySearches: 200 },
  ];

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'Very High':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero */}
      <section className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Complete India Coverage</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Rank #1 on Google Maps in Your City
            </h1>

            <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
              Choose your city and get a complete, proven strategy to rank higher on Google Maps, get more reviews, and attract more customers to your local business.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 max-w-2xl">
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <span className="text-2xl">📍</span>
                <div>
                  <div className="font-semibold text-slate-900">15+ City Guides</div>
                  <p className="text-sm text-slate-600">Covering major Indian cities</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
                <span className="text-2xl">⭐</span>
                <div>
                  <div className="font-semibold text-slate-900">Proven Strategies</div>
                  <p className="text-sm text-slate-600">Used by 120+ businesses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* City Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-slate-900 mb-10">Choose Your City</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/google-maps-seo/${city.slug}`}
              className="group bg-white rounded-lg border border-slate-200 p-6 hover:border-blue-300 hover:shadow-lg transition"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{city.name}</h3>
                    <p className="text-slate-600 text-sm">{city.region}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Competition Level</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCompetitionColor(city.competition)}`}>
                      {city.competition}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Monthly Searches</span>
                    <span className="font-semibold text-slate-900">{city.estimatedMonthlySearches}+</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-blue-600 text-sm font-semibold">View complete guide →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Coming Soon */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-3">More Cities Coming Soon</h3>
          <p className="text-slate-600 mb-4">
            We're expanding to cover all major Indian cities. The following cities will be added soon:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Gurgaon', 'Noida', 'Kochi', 'Visakhapatnam', 'Nagpur', 'Bhopal', 'Ghaziabad', 'Faridabad'].map(
              (city) => (
                <div key={city} className="text-slate-600 text-sm">
                  ✓ {city}
                </div>
              )
            )}
          </div>
        </div>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Frequently Asked Questions</h2>

          <div className="space-y-4 max-w-3xl">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Which city should I choose?</h3>
              <p className="text-slate-600">
                Choose the city where your primary business location is. If you have multiple locations, create
                separate profiles for each and optimize them using the relevant city guide.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Are these guides free?</h3>
              <p className="text-slate-600">
                Yes! All city guides are completely free. We also offer a free tier of BizLocalPilot AI to help
                automate your Google Maps optimization.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">How long does it take to see results?</h3>
              <p className="text-slate-600">
                Most businesses see improvements within 30-90 days by following the strategies in their city guide.
                However, some quick wins can be seen within the first 2 weeks.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-2">Can I use BizLocalPilot AI with these guides?</h3>
              <p className="text-slate-600">
                Absolutely! BizLocalPilot AI automates many of the strategies mentioned in the guides, making it
                easier to rank higher on Google Maps. Start for free at{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                  bizlocalpilot.com
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Start Ranking #1 on Google Maps Today</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Pick your city, follow the complete guide, and watch your Google Maps visibility transform.
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
          >
            Try BizLocalPilot AI Free
          </Link>
        </section>
      </div>
    </div>
  );
}
