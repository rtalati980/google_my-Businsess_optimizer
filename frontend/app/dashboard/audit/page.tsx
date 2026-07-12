'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import {
  ClipboardCheck, CheckCircle2, AlertTriangle, XCircle,
  Loader2, Sparkles, Image as ImageIcon, Clock, Globe,
  Phone, MapPin, Tag, FileText, MessageSquare, Star,
  ChevronRight, Zap, ArrowRight, Building2
} from 'lucide-react';

interface AuditItem {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  icon: any;
  current: string;
  recommendation: string;
  impact: string;
}

export default function AuditPage() {
  const { selectedLocation } = useDashboard();
  const [loading, setLoading] = useState(true);
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    if (!selectedLocation) return;
    setLoading(true);
    // Fetch review count for the audit
    apiService.getReviews(selectedLocation.id, [], 0, 1)
      .then(data => { setReviewCount(data.totalElements || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedLocation]);

  const auditItems: AuditItem[] = useMemo(() => {
    if (!selectedLocation) return [];
    const loc = selectedLocation;
    return [
      {
        name: 'Business Name',
        status: loc.name ? 'pass' : 'fail',
        icon: Building2,
        current: loc.name || 'Not set',
        recommendation: loc.name ? 'Your business name looks good!' : 'Add your business name immediately.',
        impact: 'Critical for search visibility'
      },
      {
        name: 'Business Category',
        status: loc.category ? 'pass' : 'fail',
        icon: Tag,
        current: loc.category || 'Not set',
        recommendation: loc.category ? 'Category is set. Consider adding secondary categories.' : 'Set your primary business category.',
        impact: '+15 SEO Score'
      },
      {
        name: 'Business Description',
        status: loc.description && loc.description.length >= 100 ? 'pass' : loc.description ? 'warn' : 'fail',
        icon: FileText,
        current: loc.description ? `${loc.description.length} characters` : 'Not set',
        recommendation: loc.description && loc.description.length >= 100
          ? 'Great description length!'
          : 'Write a 250+ character description with local keywords.',
        impact: '+12 SEO Score'
      },
      {
        name: 'Phone Number',
        status: loc.phone ? 'pass' : 'fail',
        icon: Phone,
        current: loc.phone || 'Not set',
        recommendation: loc.phone ? 'Phone number is configured.' : 'Add a phone number to enable calls.',
        impact: '+8 Leads'
      },
      {
        name: 'Website URL',
        status: loc.website ? 'pass' : 'warn',
        icon: Globe,
        current: loc.website || 'Not set',
        recommendation: loc.website ? 'Website is linked.' : 'Add your website URL for more traffic.',
        impact: '+10 Traffic'
      },
      {
        name: 'Business Address',
        status: loc.address ? 'pass' : 'fail',
        icon: MapPin,
        current: loc.address || 'Not set',
        recommendation: loc.address ? 'Address is complete.' : 'Add your full business address.',
        impact: 'Critical for Maps ranking'
      },
      {
        name: 'Business Hours',
        status: 'warn',
        icon: Clock,
        current: 'Review recommended',
        recommendation: 'Verify your business hours are up-to-date, including special hours for holidays.',
        impact: '+5 Trust Score'
      },
      {
        name: 'Customer Reviews',
        status: reviewCount >= 10 ? 'pass' : reviewCount >= 3 ? 'warn' : 'fail',
        icon: MessageSquare,
        current: `${reviewCount} reviews`,
        recommendation: reviewCount >= 10
          ? `Great! You have ${reviewCount} reviews. Keep responding to maintain engagement.`
          : 'Request more reviews from satisfied customers. Aim for 20+.',
        impact: '+20 Trust & SEO'
      },
      {
        name: 'Review Response Rate',
        status: 'warn',
        icon: Star,
        current: 'Needs analysis',
        recommendation: 'Reply to 100% of reviews within 24 hours. This directly impacts rankings.',
        impact: '+15 SEO Score'
      },
      {
        name: 'Photos & Media',
        status: 'warn',
        icon: ImageIcon,
        current: 'Needs more photos',
        recommendation: 'Upload exterior, interior, team, and product photos. Aim for 25+ photos.',
        impact: '+18 Visibility'
      },
      {
        name: 'Google Posts',
        status: 'warn',
        icon: Zap,
        current: 'Review posting frequency',
        recommendation: 'Publish 2-3 Google posts per week with offers, updates, or events.',
        impact: '+14 Engagement'
      },
    ];
  }, [selectedLocation, reviewCount]);

  const passCount = auditItems.filter(i => i.status === 'pass').length;
  const warnCount = auditItems.filter(i => i.status === 'warn').length;
  const failCount = auditItems.filter(i => i.status === 'fail').length;
  const overallScore = auditItems.length > 0 
    ? Math.round((passCount * 100 + warnCount * 50) / auditItems.length) 
    : 0;

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'warn': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return null;
    }
  };

  const statusBg = (status: string) => {
    switch (status) {
      case 'pass': return 'border-emerald-500/20 bg-emerald-500/5';
      case 'warn': return 'border-amber-500/20 bg-amber-500/5';
      case 'fail': return 'border-red-500/20 bg-red-500/5';
      default: return '';
    }
  };

  if (!selectedLocation) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground gap-3">
        <ClipboardCheck className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm">Select a location to run the profile audit</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-4 w-96 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
          <ClipboardCheck className="h-7 w-7 text-primary" />
          Profile Audit
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered audit of <span className="font-semibold text-foreground">{selectedLocation.name}</span>&apos;s Google Business Profile
        </p>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="relative">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
              <circle cx="48" cy="48" r="40" fill="none" 
                stroke={overallScore >= 80 ? '#22c55e' : overallScore >= 50 ? '#eab308' : '#ef4444'} 
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 40} 
                strokeDashoffset={2 * Math.PI * 40 - (overallScore / 100) * 2 * Math.PI * 40}
                transform="rotate(-90 48 48)"
                style={{ transition: 'stroke-dashoffset 1s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black">{overallScore}</span>
              <span className="text-[9px] font-semibold text-muted-foreground">/100</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground mt-2">Audit Score</span>
        </div>

        <div className="md:col-span-3 grid grid-cols-3 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-emerald-500">{passCount}</p>
            <p className="text-[11px] font-semibold text-muted-foreground">Passed</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-amber-500">{warnCount}</p>
            <p className="text-[11px] font-semibold text-muted-foreground">Warnings</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5 text-center">
            <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-red-500">{failCount}</p>
            <p className="text-[11px] font-semibold text-muted-foreground">Critical</p>
          </div>
        </div>
      </div>

      {/* Audit Items */}
      <div className="space-y-3">
        {auditItems.map((item, i) => (
          <div key={i} className={`border rounded-2xl p-4 sm:p-5 transition-all hover:shadow-sm ${statusBg(item.status)}`}>
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-0.5">
                {statusIcon(item.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold">{item.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.status === 'pass' ? 'badge-success' : 
                    item.status === 'warn' ? 'badge-warning' : 'badge-danger'
                  }`}>
                    {item.status === 'pass' ? 'Passed' : item.status === 'warn' ? 'Needs Attention' : 'Critical'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Current: <span className="font-medium text-foreground">{item.current}</span></p>
                <div className="flex items-start gap-2 mt-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.recommendation}</p>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Impact: {item.impact}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-bold">AI Recommendations Summary</h3>
        </div>
        <div className="space-y-2">
          {failCount > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-red-500" />
              <span><strong className="text-red-500">{failCount} critical items</strong> need immediate attention to improve your rankings.</span>
            </p>
          )}
          {warnCount > 0 && (
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <ArrowRight className="h-3.5 w-3.5 text-amber-500" />
              <span><strong className="text-amber-500">{warnCount} items</strong> have room for improvement to boost visibility.</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <ArrowRight className="h-3.5 w-3.5 text-primary" />
            <span>Completing all recommendations could increase your SEO score by an estimated <strong className="text-primary">+50 points</strong>.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
