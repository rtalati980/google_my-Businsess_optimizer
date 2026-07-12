'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDashboard } from './layout';
import { apiService } from '@/lib/api';
import { DashboardInsights } from '@/lib/types';
import { 
  TrendingUp, Phone, Globe, Navigation, Search, 
  Map, Star, MessageSquare, AlertCircle, Loader2, ArrowUpRight,
  RefreshCw, Image as ImageIcon, Users, CalendarCheck, Eye,
  Zap, CheckCircle2, ChevronRight, Sparkles, Target,
  ArrowUp, ArrowDown, Activity, BarChart3
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend,
  PieChart, Pie, Cell
} from 'recharts';

// Health Score Component
function HealthScoreRing({ score, label }: { score: number; label: string }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" 
            stroke="hsl(var(--border))" strokeWidth="10" />
          <circle cx="64" cy="64" r={radius} fill="none" 
            stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}</span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="text-xs font-semibold text-muted-foreground mt-2">{label}</span>
    </div>
  );
}

// Metric Card Component
function MetricCard({ name, value, icon: Icon, trend, trendValue, color, desc }: {
  name: string; value: string; icon: any; trend?: 'up' | 'down' | 'flat'; 
  trendValue?: string; color: string; desc?: string;
}) {
  return (
    <div className="metric-card group">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{name}</span>
        <div className={`p-2 rounded-xl ${color} transition-transform group-hover:scale-110`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <span className="text-2xl font-black tracking-tight">{value}</span>
        {trend && trendValue && (
          <span className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'text-emerald-500 bg-emerald-500/10' : 
            trend === 'down' ? 'text-red-500 bg-red-500/10' : 'text-muted-foreground bg-muted'
          }`}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : trend === 'down' ? <ArrowDown className="h-3 w-3" /> : null}
            {trendValue}
          </span>
        )}
      </div>
      {desc && <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>}
    </div>
  );
}

// AI Action Item
function ActionItem({ text, impact, icon: Icon }: { text: string; impact: string; icon: any }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer group">
      <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5 shrink-0">
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{text}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{impact}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
    </div>
  );
}

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

  // Compute AI Health Score from available data
  const healthScore = useMemo(() => {
    if (!insights) return 0;
    let score = 40; // base
    if (insights.averageRating >= 4.5) score += 15;
    else if (insights.averageRating >= 4.0) score += 10;
    else if (insights.averageRating >= 3.0) score += 5;
    if (insights.reviewCount >= 50) score += 10;
    else if (insights.reviewCount >= 20) score += 7;
    else if (insights.reviewCount >= 5) score += 4;
    if (insights.calls && insights.calls > 0) score += 10;
    if (insights.websiteClicks && insights.websiteClicks > 0) score += 8;
    if (insights.directionRequests && insights.directionRequests > 0) score += 7;
    if (insights.searchViews && insights.searchViews > 100) score += 5;
    if (insights.mapsViews && insights.mapsViews > 50) score += 5;
    return Math.min(score, 100);
  }, [insights]);

  const profileCompletion = useMemo(() => {
    if (!selectedLocation) return 0;
    let completed = 0;
    let total = 7;
    if (selectedLocation.name) completed++;
    if (selectedLocation.address) completed++;
    if (selectedLocation.phone) completed++;
    if (selectedLocation.website) completed++;
    if (selectedLocation.category) completed++;
    if (selectedLocation.description) completed++;
    if (insights && insights.reviewCount > 0) completed++;
    return Math.round((completed / total) * 100);
  }, [selectedLocation, insights]);

  // AI-generated action items based on profile status
  const actionItems = useMemo(() => {
    const items: { text: string; impact: string; icon: any }[] = [];
    if (!insights) return items;

    if (insights.averageRating < 4.5 && insights.reviewCount > 0) {
      items.push({ text: 'Reply to pending reviews to boost your rating', impact: '+5 SEO Score', icon: MessageSquare });
    }
    items.push({ text: 'Upload 5 new photos to your profile', impact: '+8 Visibility', icon: ImageIcon });
    items.push({ text: 'Publish 2 Google Posts this week', impact: '+12 Engagement', icon: Zap });
    if (!selectedLocation?.description || selectedLocation.description.length < 100) {
      items.push({ text: 'Optimize your business description with keywords', impact: '+10 SEO Score', icon: Target });
    }
    items.push({ text: 'Add 3 FAQs to your profile', impact: '+6 Trust Score', icon: CheckCircle2 });
    items.push({ text: 'Update your business hours for the week', impact: '+3 Accuracy', icon: CalendarCheck });
    return items.slice(0, 5);
  }, [insights, selectedLocation]);

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Skeleton loading */}
        <div className="flex items-center justify-between">
          <div>
            <div className="skeleton h-8 w-64 mb-2" />
            <div className="skeleton h-4 w-96" />
          </div>
          <div className="skeleton h-10 w-40 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="skeleton h-48 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl md:col-span-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !selectedLocation) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
        <div className="p-4 rounded-2xl bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-sm font-medium">{error || 'Select a business location to view insights'}</p>
      </div>
    );
  }

  if (!insights) return null;

  const hasInteractions = insights.dailyInteractions && insights.dailyInteractions.length > 0;
  const hasReviewGrowth = insights.reviewGrowth && insights.reviewGrowth.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights for <span className="font-semibold text-foreground">{selectedLocation.name}</span>
          </p>
        </div>
        <button
          onClick={() => fetchInsights(true)}
          disabled={loading || refreshing}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 gradient-bg text-white text-xs font-bold rounded-xl active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Syncing live...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Sync Metrics
            </>
          )}
        </button>
      </div>

      {/* Health Score + AI Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Card */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold">AI Health Score</h3>
          </div>
          <HealthScoreRing score={healthScore} label="Business Health" />
          <div className="mt-4 flex items-center gap-4">
            <div className="text-center">
              <p className="text-lg font-black">{profileCompletion}%</p>
              <p className="text-[10px] text-muted-foreground font-medium">Profile Complete</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-black">{insights.reviewCount}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Total Reviews</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <p className="text-lg font-black">{insights.averageRating > 0 ? insights.averageRating.toFixed(1) : '—'}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Avg Rating</p>
            </div>
          </div>
        </div>

        {/* AI Action Center */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold">AI Action Center</h3>
            </div>
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {actionItems.length} tasks
            </span>
          </div>
          <div className="space-y-1">
            {actionItems.map((item, i) => (
              <ActionItem key={i} {...item} />
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard name="Search Views" value={insights.searchViews?.toLocaleString() ?? '—'} 
          icon={Search} color="text-blue-500 bg-blue-500/10" trend="up" trendValue="+12%" desc="Google Search" />
        <MetricCard name="Maps Views" value={insights.mapsViews?.toLocaleString() ?? '—'} 
          icon={Map} color="text-emerald-500 bg-emerald-500/10" trend="up" trendValue="+8%" desc="Google Maps" />
        <MetricCard name="Phone Calls" value={insights.calls?.toLocaleString() ?? '—'} 
          icon={Phone} color="text-violet-500 bg-violet-500/10" trend="up" trendValue="+5%" desc="Last 30 days" />
        <MetricCard name="Website Clicks" value={insights.websiteClicks?.toLocaleString() ?? '—'} 
          icon={Globe} color="text-cyan-500 bg-cyan-500/10" trend="up" trendValue="+15%" desc="Profile clicks" />
        <MetricCard name="Directions" value={insights.directionRequests?.toLocaleString() ?? '—'} 
          icon={Navigation} color="text-orange-500 bg-orange-500/10" trend="up" trendValue="+3%" desc="Navigation reqs" />
        <MetricCard name="Avg Rating" value={insights.averageRating > 0 ? `${insights.averageRating.toFixed(1)}★` : '—'} 
          icon={Star} color="text-amber-500 bg-amber-500/10" 
          trend={insights.averageRating >= 4.5 ? 'up' : insights.averageRating >= 3.5 ? 'flat' : 'down'}
          trendValue={insights.averageRating >= 4.5 ? 'Excellent' : insights.averageRating >= 3.5 ? 'Good' : 'Needs work'}
          desc={`${insights.reviewCount} reviews`} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactions Chart */}
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Interactions Over Time
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                {hasInteractions ? 'Daily profile activity from Google Business' : 'Connect your GMB account to view data'}
              </p>
            </div>
          </div>
          {hasInteractions ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insights.dailyInteractions} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(252, 87%, 60%)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="hsl(252, 87%, 60%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))', 
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'hsl(var(--foreground))' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="views" name="Search Views" stroke="hsl(252, 87%, 60%)" fillOpacity={1} fill="url(#colorViews)" strokeWidth={2} />
                <Area type="monotone" dataKey="calls" name="Calls" stroke="hsl(142, 71%, 45%)" fillOpacity={1} fill="url(#colorCalls)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm">Interaction data will appear once synced</p>
            </div>
          )}
        </div>

        {/* Review Growth Chart */}
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Review Growth
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1">
              {hasReviewGrowth ? 'Monthly review accumulation' : 'No review history'}
            </p>
          </div>
          {hasReviewGrowth ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={insights.reviewGrowth} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'hsl(var(--foreground))' 
                    }}
                  />
                  <Bar dataKey="reviewsCount" name="Reviews" fill="hsl(252, 87%, 60%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <Star className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm">Reviews will appear once synced</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-4 text-center">
          <Eye className="h-5 w-5 text-violet-500 mx-auto mb-2" />
          <p className="text-lg font-black">{((insights.searchViews || 0) + (insights.mapsViews || 0)).toLocaleString()}</p>
          <p className="text-[10px] font-semibold text-muted-foreground">Total Visibility</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
          <Users className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-lg font-black">{((insights.calls || 0) + (insights.websiteClicks || 0) + (insights.directionRequests || 0)).toLocaleString()}</p>
          <p className="text-[10px] font-semibold text-muted-foreground">Total Engagements</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
          <MessageSquare className="h-5 w-5 text-amber-500 mx-auto mb-2" />
          <p className="text-lg font-black">{insights.reviewCount}</p>
          <p className="text-[10px] font-semibold text-muted-foreground">Total Reviews</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-sky-500/10 border border-blue-500/20 rounded-2xl p-4 text-center">
          <Activity className="h-5 w-5 text-blue-500 mx-auto mb-2" />
          <p className="text-lg font-black">{healthScore}/100</p>
          <p className="text-[10px] font-semibold text-muted-foreground">Health Score</p>
        </div>
      </div>
    </div>
  );
}
