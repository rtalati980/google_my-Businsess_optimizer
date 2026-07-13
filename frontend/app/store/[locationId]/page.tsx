'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Globe, Star, MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

const API_URL = typeof window !== 'undefined' 
  ? '' 
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');

interface ReviewData {
  id: string;
  reviewerName: string;
  reviewerProfilePhoto: string;
  rating: number;
  comment: string;
  date: string;
  ownerReply?: string;
}

interface LocationData {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewData[];
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  return (
    <div className={`flex gap-0.5 ${size === 'lg' ? 'gap-1' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} ${
            star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
          }`}
        />
      ))}
    </div>
  );
}

export default function PublicStorePage({ params }: { params: Promise<{ locationId: string }> }) {
  const { locationId } = React.use(params);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(`${API_URL}/api/public/locations/${locationId}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const data: LocationData = await res.json();
        setLocation(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (locationId) {
      fetchLocation();
    }
  }, [locationId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Loading store profile...</p>
        </div>
      </div>
    );
  }

  if (notFound || !location) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="text-6xl">🏪</div>
          <h1 className="text-2xl font-bold">Store not found</h1>
          <p className="text-slate-400">This business profile is not available.</p>
          <a href="/" className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 text-sm font-semibold">
            <ArrowLeft className="h-4 w-4" /> Go back
          </a>
        </div>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.name + ' ' + location.address)}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-600/10 blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-violet-600 flex items-center justify-center">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
          <span className="text-sm font-bold text-slate-300">BizLocalPilot AI</span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:block">Powered by AI</span>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        {/* Hero Card */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-700/50">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl" />

          <div className="relative p-8 space-y-4">
            {/* Category badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-full text-xs font-semibold text-violet-300">
              <CheckCircle2 className="h-3 w-3" />
              {location.category}
            </span>

            <h1 className="text-3xl sm:text-4xl font-black leading-tight">
              {location.name}
            </h1>

            {/* Aggregate Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={location.averageRating} size="lg" />
              <div>
                <span className="text-2xl font-black text-amber-400">{location.averageRating.toFixed(1)}</span>
                <span className="text-slate-400 text-sm ml-1.5">({location.totalReviews} reviews)</span>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {location.address && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <MapPin className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-white leading-snug">{location.address}</span>
                </a>
              )}
              {location.phone && (
                <a
                  href={`tel:${location.phone}`}
                  className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <Phone className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-white">{location.phone}</span>
                </a>
              )}
              {location.website && (
                <a
                  href={location.website.startsWith('http') ? location.website : `https://${location.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group"
                >
                  <Globe className="h-4 w-4 text-sky-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300 group-hover:text-white truncate">Visit Website</span>
                </a>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`tel:${location.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-violet-600/25 hover:scale-[1.01]"
              >
                <Phone className="h-4 w-4" /> Call Now
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-xl transition-all duration-200 hover:scale-[1.01]"
              >
                <MapPin className="h-4 w-4" /> Get Directions
              </a>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {location.reviews.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-violet-400" />
              Customer Reviews
            </h2>
            <div className="space-y-4">
              {location.reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 space-y-3 hover:border-slate-600/50 transition-colors"
                >
                  {/* Reviewer Info */}
                  <div className="flex items-center gap-3">
                    {review.reviewerProfilePhoto ? (
                      <img
                        src={review.reviewerProfilePhoto}
                        alt={review.reviewerName}
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-slate-700"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${review.reviewerName}&background=6d28d9&color=fff&size=40`;
                        }}
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-bold text-violet-300">
                        {review.reviewerName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-100 text-sm">{review.reviewerName}</p>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        {review.date && (
                          <span className="text-xs text-slate-500">
                            {new Date(review.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.comment && (
                    <p className="text-sm text-slate-300 leading-relaxed">{review.comment}</p>
                  )}

                  {/* Owner Reply */}
                  {review.ownerReply && (
                    <div className="bg-violet-950/40 border border-violet-700/30 rounded-xl p-3.5 space-y-1">
                      <p className="text-xs font-bold text-violet-400">Owner's Response</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{review.ownerReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Powered By Footer */}
        <footer className="text-center py-6 border-t border-slate-800/50 space-y-2">
          <p className="text-xs text-slate-600">
            This page is powered by{' '}
            <a href="/" className="text-violet-400 hover:text-violet-300 font-semibold">
              BizLocalPilot AI
            </a>{' '}
            — Help your business grow online.
          </p>
        </footer>
      </main>
    </div>
  );
}
