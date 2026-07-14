'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TrendingUp, Sparkles, Search, Star, Lightbulb, BarChart2, Loader2, AlertCircle, ExternalLink, PenLine, Check, Plus, Upload } from 'lucide-react';
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
      <div className="relative flex items-center justify-center" style={{ width: radius * 2, height: radius * 2 }}>
        <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
          <circle
            className="text-border"
            stroke="currentColor"
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
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-black leading-none text-foreground" style={{ color }}>{score}</span>
          <span className="text-[10px] font-bold text-muted-foreground mt-0.5">/100</span>
        </div>
      </div>
      <span className="text-sm font-bold mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

function SectionCard({ icon: Icon, title, content, color }: { icon: React.ElementType; title: string; content: string; color: string }) {
  const bullets = useMemo(() => {
    return content
      .split(/\n|(?<=\.)\s+(?=[A-Z0-9])/)
      .map((s) => s.trim())
      .filter((s) => s.length > 4);
  }, [content]);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl" style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80 leading-relaxed">
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

  // Profile editor state
  const [editDescription, setEditDescription] = useState('');
  const [editName, setEditName] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [pushing, setPushing] = useState(false);
  const [pushSuccess, setPushSuccess] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);

  const token = typeof window !== 'undefined' ? localStorage.getItem('gmb_auth_token') : null;

  // Load location details into the edit fields
  useEffect(() => {
    if (selectedLocation) {
      setEditName(selectedLocation.name || '');
      setEditWebsite(selectedLocation.website || '');
      setEditPhone(selectedLocation.phone || '');
      setEditDescription(selectedLocation.description || '');
    }
  }, [selectedLocation]);

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

  const handlePushProfile = async () => {
    if (!selectedLocation) return;
    try {
      setPushing(true);
      setPushSuccess(false);
      const res = await fetch(`${API_URL}/api/locations/${selectedLocation.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          category: selectedLocation.category || '',
          phone: editPhone,
          website: editWebsite,
          address: selectedLocation.address || '',
          description: editDescription,
        }),
      });
      if (res.ok) {
        setPushSuccess(true);
        setTimeout(() => setPushSuccess(false), 3000);
      }
    } catch {
      setError('Failed to push profile update.');
    } finally {
      setPushing(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!selectedLocation) return;
    try {
      setGeneratingDesc(true);
      setError('');
      const res = await fetch(`${API_URL}/api/locations/${selectedLocation.id}/seo-description`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          keywords: parsedKeywords,
        }),
      });
      if (!res.ok) throw new Error('Failed to generate description');
      const data = await res.json();
      if (data.description) {
        setEditDescription(data.description);
      }
    } catch {
      setError('Could not generate description. Please try again.');
    } finally {
      setGeneratingDesc(false);
    }
  };

  const insertKeyword = (keyword: string) => {
    const trimmed = keyword.trim();
    if (editDescription.toLowerCase().includes(trimmed.toLowerCase())) return;
    if (editDescription.length > 0 && !editDescription.endsWith('. ') && !editDescription.endsWith('.')) {
      setEditDescription(prev => prev + '. ' + trimmed);
    } else {
      setEditDescription(prev => prev + trimmed);
    }
  };

  const parsedKeywords = useMemo(() => {
    return audit
      ? audit.keywordSuggestions
          .split(',')
          .map((k) => k.replace(/\n/g, ' ').replace(/^\d+\.\s*/, '').trim())
          .filter((k) => k.length > 2)
      : [];
  }, [audit]);

  const publicPageUrl = selectedLocation
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/store/${selectedLocation.id}`
    : '';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-500" />
            AI SEO Auditor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze your Google Business Profile to rank higher on Maps and Search.
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !selectedLocation}
          className="flex items-center justify-center gap-2 px-5 py-3 gradient-bg hover:opacity-95 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {analyzing ? 'Analyzing Profile…' : 'Analyze with AI'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm">Fetching SEO reports...</p>
        </div>
      ) : !audit ? (
        <div className="text-center text-muted-foreground py-20 bg-card rounded-2xl border border-dashed border-border shadow-sm">
          <TrendingUp className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="font-semibold text-foreground">No audit yet for this location.</p>
          <p className="text-xs">Click <strong className="text-primary font-bold">Analyze with AI</strong> to generate your first SEO report.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main audit content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-around gap-6 shadow-sm">
              <ScoreDial score={audit.seoScore} />
              
              <div className="space-y-4 max-w-sm">
                <div>
                  <h3 className="font-bold text-foreground">SEO Health Status</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your profile scoring is at {audit.seoScore}%. Incorporate recommended keywords into your description to increase traffic matching.
                  </p>
                </div>

                {publicPageUrl && (
                  <div>
                    <a
                      href={publicPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                    >
                      View Branded Store Page <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Share this custom storefront with local consumers to capture reviews.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SectionCard icon={Lightbulb} title="SEO Recommendations" content={audit.profileSuggestions} color="#3b82f6" />
              <SectionCard icon={BarChart2} title="Competitor Insights" content={audit.competitorInsights} color="#8b5cf6" />
            </div>

            {/* ────────── PROFILE OPTIMIZER SECTION ────────── */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <PenLine className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">Optimize & Push to Google</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Click keywords below to add them to your description, then push live.</p>
                  </div>
                </div>
                <button
                  onClick={handlePushProfile}
                  disabled={pushing || !editName}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-600/20 disabled:opacity-50 self-start sm:self-center"
                >
                  {pushing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : pushSuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {pushing ? 'Pushing…' : pushSuccess ? 'Updated!' : 'Push to Google'}
                </button>
              </div>

              {/* Clickable Keyword Tags */}
              <div className="relative">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Click to add keyword to description</p>
                <div className="flex flex-wrap gap-2">
                  {parsedKeywords.map((keyword, i) => {
                    const isUsed = editDescription.toLowerCase().includes(keyword.toLowerCase());
                    return (
                      <button
                        key={i}
                        onClick={() => insertKeyword(keyword)}
                        disabled={isUsed}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full transition-all active:scale-95 ${
                          isUsed
                            ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 cursor-default'
                            : 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 cursor-pointer'
                        }`}
                      >
                        {isUsed ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                        {keyword}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Business Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Website</label>
                  <input
                    type="text"
                    value={editName ? editWebsite : ''}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://yoursite.com"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Description Editor */}
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    Business Description (SEO Optimized)
                    <button
                      type="button"
                      onClick={handleGenerateDescription}
                      disabled={generatingDesc}
                      className="px-2 py-0.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-md text-[9px] font-black flex items-center gap-1 transition-all"
                      title="Automatically write optimized description using AI and local keywords"
                    >
                      {generatingDesc ? (
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                      ) : (
                        <Sparkles className="h-2.5 w-2.5" />
                      )}
                      {generatingDesc ? 'Generating...' : 'AI Generate'}
                    </button>
                  </label>
                  <span className={`text-[10px] font-bold ${editDescription.length > 750 ? 'text-destructive font-black' : editDescription.length > 500 ? 'text-amber-500 font-bold' : 'text-muted-foreground'}`}>
                    {editDescription.length} / 750 chars
                  </span>
                </div>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  maxLength={750}
                  placeholder="Write a keyword-rich business description. Click keywords above to quickly add them here…"
                  className="w-full px-3 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {pushSuccess && (
                <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold animate-in fade-in duration-300">
                  <Check className="h-4 w-4" />
                  Profile updated successfully! Changes pushed to Google Business Profile.
                </div>
              )}
            </div>
          </div>

          {/* Tag Cloud Column */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-foreground flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                Recommended Local Keywords
              </h3>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Rank higher in localized &ldquo;near me&rdquo; maps queries by naturally introducing these keywords.
              </p>
              <div className="flex flex-wrap gap-2">
                {parsedKeywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-primary/10 border border-primary/20 text-primary"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
