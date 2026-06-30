'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Sparkles, Search, Star, Lightbulb, BarChart2, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { useDashboard } from '../layout';

interface SEOAudit {
  id: string;
  seoScore: number;
  keywordSuggestions: string;
  profileSuggestions: string;
  competitorInsights: string;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

function ScoreDial({ score }: { score: number }) {
  const radius = 70;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label =
    score >= 75 ? 'Excellent' : score >= 50 ? 'Average' : 'Needs Work';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle
          stroke="rgba(255,255,255,0.07)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black" style={{ color }}>{score}</span>
        <span className="text-xs font-semibold text-slate-400">/100</span>
      </div>
      <span className="text-sm font-bold" style={{ color }}>{label}</span>
    </div>
  );
}

function SectionCard({ icon: Icon, title, content, color }: { icon: React.ElementType; title: string; content: string; color: string }) {
  const bullets = content
    .split(/\n|(?<=\.)\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4);

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className={`p-2 rounded-xl`} style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <h3 className="font-bold text-slate-100">{title}</h3>
      </div>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
            {b.replace(/^\d+\.\s*/, '').replace(/^[-–•]\s*/, '')}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SeoAuditorPage() {
  const { selectedLocation } = useDashboard();
  const [audit, setAudit] = useState<SEOAudit | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('gmb_auth_token') : null;

  const fetchLatestAudit = useCallback(async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/locations/${selectedLocation.id}/seo-audits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: SEOAudit[] = await res.json();
        if (data.length > 0) setAudit(data[0]);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, token]);

  useEffect(() => {
    fetchLatestAudit();
  }, [fetchLatestAudit]);

  const handleAnalyze = async () => {
    if (!selectedLocation) return;
    try {
      setAnalyzing(true);
      setError('');
      const res = await fetch(`${API_URL}/api/locations/${selectedLocation.id}/seo-audits/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data: SEOAudit = await res.json();
      setAudit(data);
    } catch {
      setError('Could not generate audit. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const publicPageUrl = selectedLocation
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/store/${selectedLocation.id}`
    : '';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-400" />
            AI SEO Auditor
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Analyze your Google Business Profile to rank higher on Maps and Search.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !selectedLocation}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {analyzing ? 'Analyzing Profile…' : 'Analyze with AI'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle className="h-4 w-4" /> {error}
        </div>
      )}

      {!selectedLocation && (
        <div className="text-center text-slate-500 py-20 bg-slate-900/40 rounded-2xl border border-dashed border-slate-700">
          Please select a location to run an SEO audit.
        </div>
      )}

      {selectedLocation && loading && !audit && (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 text-emerald-400 animate-spin" />
        </div>
      )}

      {selectedLocation && !loading && !audit && !analyzing && (
        <div className="text-center py-24 bg-slate-900/40 rounded-2xl border border-dashed border-slate-700 space-y-3">
          <TrendingUp className="h-10 w-10 text-slate-600 mx-auto" />
          <p className="text-slate-400 font-semibold">No audit yet for this location.</p>
          <p className="text-slate-500 text-sm">Click <strong>Analyze with AI</strong> to generate your first SEO report.</p>
        </div>
      )}

      {audit && (
        <div className="space-y-6">
          {/* Score Banner */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800/80 to-slate-900 border border-slate-700/50 rounded-2xl p-6 overflow-hidden">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex items-center justify-center">
                <ScoreDial score={audit.seoScore} />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-black text-white">SEO Score for <span className="text-emerald-400">{selectedLocation.name}</span></h2>
                <p className="text-slate-400 text-sm mt-1">
                  Based on profile completeness, review response rate, keyword usage, and local presence signals.
                </p>
                <p className="text-[11px] text-slate-500 mt-3">
                  Last analyzed: {new Date(audit.createdAt).toLocaleString()}
                </p>
              </div>
              {/* Public Page Link */}
              <a
                href={publicPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-semibold rounded-xl hover:bg-violet-600/30 transition-colors whitespace-nowrap"
              >
                <ExternalLink className="h-4 w-4" />
                View Public Page
              </a>
            </div>
          </div>

          {/* Suggestion Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard
              icon={Search}
              title="Keyword Suggestions"
              content={audit.keywordSuggestions}
              color="#38bdf8"
            />
            <SectionCard
              icon={Lightbulb}
              title="Profile Improvements"
              content={audit.profileSuggestions}
              color="#f59e0b"
            />
            <SectionCard
              icon={BarChart2}
              title="Competitor Insights"
              content={audit.competitorInsights}
              color="#a78bfa"
            />
          </div>

          {/* Keyword Tag Cloud */}
          <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-sky-400" />
              Recommended Local Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {audit.keywordSuggestions
                .split(',')
                .map((k) => k.replace(/\n/g, ' ').replace(/^\d+\.\s*/, '').trim())
                .filter((k) => k.length > 2)
                .map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300"
                  >
                    {keyword}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
