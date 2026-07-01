'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from './layout';
import { apiService } from '@/lib/api';
import { DashboardInsights } from '@/lib/types';
import { 
  TrendingUp, Phone, Globe, Navigation, Search, 
  Map, Star, MessageSquare, AlertCircle, Loader2, ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

export default function DashboardPage() {
  const { selectedLocation } = useDashboard();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async (forceRefresh = false) => {
    if (!selectedLocation) return;
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await apiService.getLocationInsights(selectedLocation.id, forceRefresh);
      setInsights(data);
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      setError('Failed to load insights for this location.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights(false);
  }, [selectedLocation]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm">Fetching GMB profile insights...</p>
      </div>
    );
  }

  if (error || !selectedLocation) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm">{error || 'Please connect or select a GMB profile location'}</p>
      </div>
    );
  }

  if (!insights) return null;

  const stats = [
    { 
      name: 'Average Rating', 
      value: insights.averageRating > 0 ? `${insights.averageRating} / 5.0` : '—', 
      icon: Star, 
      color: 'text-amber-500 bg-amber-500/10',
      description: insights.reviewCount > 0 ? `Based on ${insights.reviewCount} synced reviews` : 'No reviews synced yet'
    },
    { 
      name: 'Phone Calls', 
      value: insights.calls != null ? insights.calls.toLocaleString() : '—', 
      icon: Phone, 
      color: 'text-emerald-500 bg-emerald-500/10',
      description: insights.calls != null ? 'Last 30 days — GMB dial triggers' : 'Requires GMB Performance API access'
    },
    { 
      name: 'Website Clicks', 
      value: insights.websiteClicks != null ? insights.websiteClicks.toLocaleString() : '—', 
      icon: Globe, 
      color: 'text-indigo-500 bg-indigo-500/10',
      description: insights.websiteClicks != null ? 'Last 30 days — profile links clicked' : 'Requires GMB Performance API access'
    },
    { 
      name: 'Directions Requests', 
      value: insights.directionRequests != null ? insights.directionRequests.toLocaleString() : '—', 
      icon: Navigation, 
      color: 'text-violet-500 bg-violet-500/10',
      description: insights.directionRequests != null ? 'Last 30 days — navigation requests' : 'Requires GMB Performance API access'
    },
  ];

  const visibilityStats = [
    { name: 'Google Search Views', value: insights.searchViews != null ? insights.searchViews.toLocaleString() : '—', icon: Search },
    { name: 'Google Maps Views', value: insights.mapsViews != null ? insights.mapsViews.toLocaleString() : '—', icon: Map },
  ];

  const hasInteractions = insights.dailyInteractions && insights.dailyInteractions.length > 0;
  const hasReviewGrowth = insights.reviewGrowth && insights.reviewGrowth.length > 0;
  const hasRealMetrics = insights.calls != null;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Profile Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Performance analytics synced from Google Business Profile for {selectedLocation.name}
          </p>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-bold rounded-xl active:scale-95 transition-all text-slate-300 disabled:opacity-50"
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
              Syncing live...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 text-violet-400" />
              Sync GMB metrics
            </>
          )}
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.name}</span>
              <div className={`p-2 rounded-xl ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-black tracking-tight">{stat.value}</span>
              {hasRealMetrics && stat.value !== '—' && stat.name !== 'Average Rating' && (
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-0.5">
                  Live <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Visibility stats banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibilityStats.map((stat) => (
          <div key={stat.name} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground">{stat.name}</p>
                <h3 className="text-2xl font-black tracking-tight mt-0.5">{stat.value}</h3>
              </div>
            </div>
            {hasRealMetrics && stat.value !== '—' && (
              <span className="text-xs text-emerald-500 font-extrabold bg-emerald-500/10 px-2.5 py-1 rounded-full">
                Last 30 days
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily interactions area chart */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-black">Interactions over time</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasInteractions ? 'Daily profile activity based on real GMB performance data' : 'No interaction data available from GMB Performance API'}
            </p>
          </div>
          {hasInteractions ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insights.dailyInteractions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '12px',
                    color: 'hsl(var(--foreground))' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="views" name="Search Views" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                <Area type="monotone" dataKey="calls" name="Calls Initiated" stroke="hsl(var(--destructive))" fillOpacity={1} fill="url(#colorCalls)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
              <AlertCircle className="h-5 w-5 mr-2 text-muted-foreground/50" />
              Connect your GMB account to view real interaction data
            </div>
          )}
        </div>

        {/* Review growth bar chart */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-black">Reviews Growth</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {hasReviewGrowth ? 'Cumulative reviews from your synced GMB account' : 'No review history yet'}
            </p>
          </div>
          {hasReviewGrowth ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.reviewGrowth} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))' 
                    }}
                  />
                  <Bar dataKey="reviewsCount" name="Reviews" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground text-sm">
              <AlertCircle className="h-5 w-5 mr-2 text-muted-foreground/50" />
              Reviews will appear here once synced from Google
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
