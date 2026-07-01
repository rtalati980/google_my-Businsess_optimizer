'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import {
  TrendingUp, Users, DollarSign, AlertTriangle, Loader2, Download, BarChart3
} from 'lucide-react';

export default function AnalyticsPage() {
  const { selectedLocation } = useDashboard();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedLocation]);

  const fetchAnalytics = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      const data = await apiService.getDashboardAnalytics(selectedLocation.id);
      setDashboard(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedLocation) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
        <AlertTriangle className="h-8 w-8 text-primary mb-2" />
        <p>Please select a business location first.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-sm">Loading Business Intelligence Hub...</p>
      </div>
    );
  }

  if (!data) return null;

  // Calculate percentages
  const total = data.totalReviews || 0;
  const positivePct = total === 0 ? 0 : Math.round((data.positiveCount / total) * 100);
  const neutralPct = total === 0 ? 0 : Math.round((data.neutralCount / total) * 100);
  const negativePct = total === 0 ? 0 : Math.round((data.negativeCount / total) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Sentiment & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time customer sentiment tracking, feedback keywords, and review response metrics.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Reviews</span>
            <Users className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="text-2xl font-black">{data.totalReviews}</div>
          <p className="text-[10px] text-muted-foreground">Synced from Google Business Profile</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average Rating</span>
            <Sparkles className="h-4.5 w-4.5 text-amber-500 fill-current" />
          </div>
          <div className="text-2xl font-black">{data.averageRating} / 5.0</div>
          <div className="flex gap-0.5 text-amber-400 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-xs">
                {i < Math.round(data.averageRating) ? '★' : '☆'}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Response Rate</span>
            <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black">{data.responseRate}%</div>
          <p className="text-[10px] text-muted-foreground">Replies published to Google</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Sentiment</span>
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
          </div>
          <div className="text-2xl font-black">
            {positivePct >= 70 ? 'Excellent 😊' : positivePct >= 50 ? 'Good 🙂' : 'Needs Work 😐'}
          </div>
          <p className="text-[10px] text-muted-foreground">{positivePct}% positive reviews</p>
        </div>
      </div>

      {/* Sentiment & Keyword breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sentiment donut chart mock (built using native SVG/HTML for absolute compatibility) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-black flex items-center gap-2">
            <BarChart3 className="h-4.5 w-4.5 text-primary" /> Sentiment Distribution
          </h3>

          {total === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs">No reviews synced to calculate sentiment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stacked Progress Bar */}
              <div className="h-6 w-full bg-secondary/30 rounded-full overflow-hidden flex">
                <div 
                  style={{ width: `${positivePct}%` }} 
                  className="bg-emerald-500 hover:opacity-90 transition-opacity" 
                  title={`Positive: ${positivePct}%`}
                />
                <div 
                  style={{ width: `${neutralPct}%` }} 
                  className="bg-amber-500 hover:opacity-90 transition-opacity" 
                  title={`Neutral: ${neutralPct}%`}
                />
                <div 
                  style={{ width: `${negativePct}%` }} 
                  className="bg-destructive hover:opacity-90 transition-opacity" 
                  title={`Negative: ${negativePct}%`}
                />
              </div>

              {/* Grid breakdown */}
              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                    <span>Positive</span>
                  </div>
                  <div className="text-lg font-black pl-4">{data.positiveCount}</div>
                  <div className="text-[10px] text-slate-400 pl-4">{positivePct}% of total</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    <span>Neutral</span>
                  </div>
                  <div className="text-lg font-black pl-4">{data.neutralCount}</div>
                  <div className="text-[10px] text-slate-400 pl-4">{neutralPct}% of total</div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <span className="w-2.5 h-2.5 bg-destructive rounded-full" />
                    <span>Negative</span>
                  </div>
                  <div className="text-lg font-black pl-4">{data.negativeCount}</div>
                  <div className="text-[10px] text-slate-400 pl-4">{negativePct}% of total</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Keywords */}
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-black flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-primary" /> Key Feedback Drivers
          </h3>
          
          {data.topKeywords && data.topKeywords.length > 0 ? (
            <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
              {data.topKeywords.slice(0, 5).map((kw: any, idx: number) => {
                const kwPct = total === 0 ? 0 : Math.round((kw.value / total) * 100);
                return (
                  <div key={kw.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="capitalize">{kw.name}</span>
                      <span className="text-muted-foreground">{kw.value} mention(s)</span>
                    </div>
                    <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${kwPct}%` }}
                        className="bg-primary h-full rounded-full" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex flex-col items-center justify-center text-muted-foreground text-center">
              <p className="text-xs">No keywords extracted yet.</p>
              <p className="text-[10px] mt-0.5">Keywords are parsed automatically from customer comments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Review Trends */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
        <h3 className="text-base font-black">Monthly Review Metrics Trend</h3>

        {total === 0 ? (
          <div className="h-32 flex items-center justify-center text-muted-foreground">
            No history trend available.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-6 gap-3 pt-6 border-b border-border pb-6 h-48 items-end">
              {data.monthlyTrends?.map((item: any) => {
                const heightVal = Math.min(100, Math.max(15, Math.round((item.count / total) * 150)));
                return (
                  <div key={item.name} className="flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="relative w-full flex justify-center">
                      <div 
                        style={{ height: `${heightVal}px` }}
                        className="w-8 sm:w-12 bg-primary/20 group-hover:bg-primary/30 border border-primary/30 group-hover:border-primary/50 rounded-t-xl transition-all duration-200"
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 dark:bg-white dark:text-slate-950 text-white text-[9px] px-1.5 py-0.5 rounded shadow-lg pointer-events-none whitespace-nowrap">
                        {item.count} reviews ({item.positive} positive)
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">{item.name}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 items-center justify-end text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-primary/20 border border-primary/30 rounded" />
                <span>Monthly Review Intake Volume</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
