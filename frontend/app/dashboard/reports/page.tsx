'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import { AIReport } from '@/lib/types';
import { 
  FileText, Sparkles, AlertCircle, Loader2, 
  Calendar, Award, Lightbulb, Compass, BarChart
} from 'lucide-react';

export default function ReportsPage() {
  const { selectedLocation } = useDashboard();
  const [reports, setReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      const data = await apiService.getReports(selectedLocation.id);
      setReports(data);
      if (data.length > 0) {
        setSelectedReport(data[0]); // default to latest report
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedLocation]);

  const handleGenerateReport = async () => {
    if (!selectedLocation) return;
    try {
      setGenerating(true);
      const newReport = await apiService.generateWeeklyReport(selectedLocation.id);
      await fetchReports();
      setSelectedReport(newReport);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setGenerating(false);
    }
  };

  if (!selectedLocation) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-muted-foreground">
        <AlertCircle className="h-8 w-8 text-primary mb-2" />
        <p>Please select a business location first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">AI Weekly Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate weekly audit performance summaries, local SEO tips, and growth guides.
          </p>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={generating}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-primary/25 text-sm"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? 'Auditing Reviews...' : 'Generate New Audit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Archives List */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-base font-black flex items-center gap-2 text-foreground/80">
            <FileText className="h-4.5 w-4.5 text-muted-foreground" /> Audit Log
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-xs leading-relaxed">
              No reports compiled yet. Click 'Generate New Audit' to analyze GMB reviews.
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'bg-primary/5 border-primary shadow-sm' 
                        : 'bg-card border-border hover:bg-secondary'
                    }`}
                  >
                    <Calendar className={`h-4.5 w-4.5 mt-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        Report Week
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {new Date(rep.startDate).toLocaleDateString()} - {new Date(rep.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Report View */}
        <div className="lg:col-span-8">
          {generating ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
               <h4 className="font-bold text-foreground">Gemini is analyzing GMB profiles...</h4>
              <p className="text-sm max-w-xs mx-auto">
                Scanning reviews text, computing average ratings, and generating local SEO keywords.
              </p>
            </div>
          ) : selectedReport ? (
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              {/* Header */}
              <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-black text-foreground">Weekly Performance Audit</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Analyzed: {new Date(selectedReport.startDate).toLocaleDateString()} to {new Date(selectedReport.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground font-semibold">
                  Compiled {new Date(selectedReport.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Sections */}
              <div className="space-y-6">
                {/* 1. Summary */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-violet-500" /> Executive Summary
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                    {selectedReport.summary}
                  </p>
                </div>

                {/* 2. Sentiment */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Award className="h-4 w-4 text-emerald-500" /> Sentiment Breakdown
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-medium bg-secondary/20 border border-border p-4 rounded-xl">
                    {selectedReport.sentimentAnalysis}
                  </p>
                </div>

                {/* 3. SEO */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" /> Local SEO Focus
                  </h4>
                  <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-medium pl-3 border-l-2 border-amber-500">
                    {selectedReport.seoRecommendations}
                  </div>
                </div>

                {/* 4. Content */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Compass className="h-4 w-4 text-indigo-500" /> Social Posting Ideas
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed font-medium bg-secondary/10 p-4 rounded-xl border border-border/50">
                    {selectedReport.contentRecommendations}
                  </p>
                </div>

                {/* 5. Growth Opportunity */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Growth Opportunities
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                    {selectedReport.growthOpportunities}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm">
              Generate or select an audit report log to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
