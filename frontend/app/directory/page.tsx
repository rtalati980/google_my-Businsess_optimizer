'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Star, Phone, Clock, ChevronRight, Loader2, Filter } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  category: string;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  website?: string;
  hours?: string;
  verified?: boolean;
  viewCount?: number;
}

export default function DirectoryPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'views' | 'name'>('rating');

  // Fetch all businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await axios.get(`${apiUrl}/api/locations/directory`);
        setBusinesses(response.data || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(businesses.map(b => b.category || 'Other'));
    return Array.from(cats).sort();
  }, [businesses]);

  // Filter and sort businesses
  const filteredBusinesses = useMemo(() => {
    let filtered = businesses.filter(b => {
      const matchesSearch =
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || b.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'views':
          return (b.viewCount || 0) - (a.viewCount || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [businesses, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-black mb-3">Business Directory</h1>
          <p className="text-lg text-violet-100">Discover local businesses optimized with AI</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search businesses, categories, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Filter className="h-5 w-5 text-slate-300" />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="views">Most Viewed</option>
              <option value="name">A-Z</option>
            </select>

            {/* Results Count */}
            <span className="text-slate-300 text-sm ml-auto">
              {filteredBusinesses.length} businesses found
            </span>
          </div>
        </div>
      </div>

      {/* Business Grid */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No businesses found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
              <Link key={business.id} href={`/store/${business.id}`}>
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300 h-full flex flex-col">
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                    {business.photoUrl ? (
                      <img
                        src={business.photoUrl}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-slate-600 text-sm">No image available</div>
                      </div>
                    )}
                    {business.verified && (
                      <div className="absolute top-3 right-3 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    {/* Name & Category */}
                    <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{business.name}</h3>
                    <p className="text-sm text-violet-400 mb-3">{business.category}</p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-white">{business.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-sm text-slate-400">({business.reviewCount} reviews)</span>
                    </div>

                    {/* Info */}
                    <div className="space-y-2 mb-4 flex-grow">
                      {business.phone && (
                        <div className="flex items-start gap-2 text-sm text-slate-300">
                          <Phone className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                          <span className="line-clamp-1">{business.phone}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-sm text-slate-300">
                        <MapPin className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                        <span className="line-clamp-2">{business.address}</span>
                      </div>
                      {business.hours && (
                        <div className="flex items-start gap-2 text-sm text-slate-300">
                          <Clock className="h-4 w-4 mt-0.5 text-slate-500 flex-shrink-0" />
                          <span className="line-clamp-1">{business.hours}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-violet-400 font-semibold mt-auto pt-4 border-t border-slate-700">
                      View Profile
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
