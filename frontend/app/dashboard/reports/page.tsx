'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import { AIReport } from '@/lib/types';
import { 
  FileText, Sparkles, AlertCircle, Loader2, 
  Calendar, Award, Lightbulb, Compass, BarChart,
  Download, ChevronRight
} from 'lucide-react';

/**
 * Lightweight markdown-to-JSX renderer.
 * Handles: ## headings, ### subheadings, numbered lists, - bullets, **bold**, --- hr, and paragraphs.
 */
function MarkdownRenderer({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      if (listType === 'ul') {
        elements.push(
          <ul key={key++} className="space-y-2 my-3 ml-1">
            {listItems}
          </ul>
        );
      } else {
        elements.push(
          <ol key={key++} className="space-y-2 my-3 ml-1">
            {listItems}
          </ol>
        );
      }
      listItems = [];
      listType = null;
    }
  };

  const formatInline = (text: string): React.ReactNode[] => {
    // Handle **bold**
    const parts: React.ReactNode[] = [];
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-foreground">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : [text];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed === '') {
      flushList();
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed)) {
      flushList();
      elements.push(<hr key={key++} className="border-border my-5" />);
      continue;
    }

    // ## Heading 2
    if (trimmed.startsWith('## ')) {
      flushList();
      const headingText = trimmed.replace(/^##\s+/, '');
      elements.push(
        <h3 key={key++} className="text-base font-black text-foreground mt-6 mb-2 flex items-center gap-2">
          {formatInline(headingText)}
        </h3>
      );
      continue;
    }

    // ### Heading 3
    if (trimmed.startsWith('### ')) {
      flushList();
      const headingText = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h4 key={key++} className="text-sm font-bold text-foreground/90 mt-4 mb-1.5">
          {formatInline(headingText)}
        </h4>
      );
      continue;
    }

    // # Heading 1
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      flushList();
      const headingText = trimmed.replace(/^#\s+/, '');
      elements.push(
        <h2 key={key++} className="text-lg font-black text-foreground mt-6 mb-3">
          {formatInline(headingText)}
        </h2>
      );
      continue;
    }

    // Numbered list: 1. 2. etc.
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(
        <li key={key++} className="flex items-start gap-3 text-sm text-foreground/85 leading-relaxed">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {numberedMatch[1]}
          </span>
          <span className="flex-1">{formatInline(numberedMatch[2])}</span>
        </li>
      );
      continue;
    }

    // Bullet list: - item or • item
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      const bulletText = trimmed.replace(/^[-•]\s+/, '');
      listItems.push(
        <li key={key++} className="flex items-start gap-2.5 text-sm text-foreground/85 leading-relaxed">
          <ChevronRight className="h-3.5 w-3.5 text-primary mt-1 flex-shrink-0" />
          <span className="flex-1">{formatInline(bulletText)}</span>
        </li>
      );
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="text-sm text-foreground/85 leading-relaxed my-1.5">
        {formatInline(trimmed)}
      </p>
    );
  }

  flushList();
  return <div className="markdown-content">{elements}</div>;
}

/**
 * Section card for individual report sections.
 */
function ReportSection({ 
  icon: Icon, 
  iconColor, 
  title, 
  content, 
  variant = 'default' 
}: { 
  icon: any; 
  iconColor: string; 
  title: string; 
  content?: string;
  variant?: 'default' | 'bordered' | 'filled';
}) {
  if (!content || content.trim().length === 0) return null;

  const bgClass = variant === 'filled' 
    ? 'bg-secondary/30 border border-border rounded-xl p-5' 
    : variant === 'bordered'
    ? 'pl-4 border-l-[3px] border-primary/30'
    : '';

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        {title}
      </h4>
      <div className={bgClass}>
        <MarkdownRenderer content={content} />
      </div>
    </div>
  );
}

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

  const handleDownload = () => {
    if (!selectedReport) return;
    const sections = [
      `# Weekly Performance Audit`,
      `Period: ${new Date(selectedReport.startDate).toLocaleDateString()} — ${new Date(selectedReport.endDate).toLocaleDateString()}`,
      '',
      '## Executive Summary',
      selectedReport.summary || '',
      '',
      '## Sentiment Analysis',
      selectedReport.sentimentAnalysis || '',
      '',
      '## SEO Recommendations',
      selectedReport.seoRecommendations || '',
      '',
      '## Content Recommendations',
      selectedReport.contentRecommendations || '',
      '',
      '## Growth Opportunities',
      selectedReport.growthOpportunities || '',
    ].join('\n');

    const blob = new Blob([sections], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report-${selectedReport.startDate}-to-${selectedReport.endDate}.md`;
    link.click();
    URL.revokeObjectURL(url);
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
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all shadow-lg shadow-primary/25 text-sm"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? 'Auditing Reviews...' : 'Generate New Audit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Archives List */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="text-base font-black flex items-center gap-2 text-foreground/80">
            <FileText className="h-4.5 w-4.5 text-muted-foreground" /> Audit Log
          </h3>

          {loading ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" /> Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-xs leading-relaxed">
              No reports compiled yet. Click &apos;Generate New Audit&apos; to analyze GMB reviews.
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
        <div className="lg:col-span-9">
          {generating ? (
            <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
               <h4 className="font-bold text-foreground">Gemini is analyzing GMB profiles...</h4>
              <p className="text-sm max-w-xs mx-auto">
                Scanning reviews text, computing average ratings, and generating local SEO keywords.
              </p>
            </div>
          ) : selectedReport ? (
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
              {/* Report Header */}
              <div className="border-b border-border px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/20">
                <div>
                  <h2 className="text-lg font-black text-foreground">Weekly Performance Audit</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Analyzed: {new Date(selectedReport.startDate).toLocaleDateString()} to {new Date(selectedReport.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Compiled {new Date(selectedReport.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={handleDownload}
                    className="p-2 hover:bg-secondary border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                    title="Download Report"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Report Body */}
              <div className="px-6 sm:px-8 py-6 space-y-8">
                {/* Executive Summary — main content */}
                <ReportSection 
                  icon={BarChart} 
                  iconColor="text-violet-500" 
                  title="Executive Summary" 
                  content={selectedReport.summary} 
                />

                {/* Sentiment Breakdown */}
                <ReportSection 
                  icon={Award} 
                  iconColor="text-emerald-500" 
                  title="Sentiment Breakdown" 
                  content={selectedReport.sentimentAnalysis} 
                  variant="filled"
                />

                {/* Local SEO Focus */}
                <ReportSection 
                  icon={Lightbulb} 
                  iconColor="text-amber-500" 
                  title="Local SEO Focus" 
                  content={selectedReport.seoRecommendations} 
                  variant="bordered"
                />

                {/* Content Recommendations */}
                <ReportSection 
                  icon={Compass} 
                  iconColor="text-indigo-500" 
                  title="Social Posting Ideas" 
                  content={selectedReport.contentRecommendations} 
                  variant="filled"
                />

                {/* Growth Opportunities */}
                <ReportSection 
                  icon={Sparkles} 
                  iconColor="text-primary" 
                  title="Growth Opportunities" 
                  content={selectedReport.growthOpportunities} 
                />
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm gap-2">
              <FileText className="h-8 w-8 text-muted-foreground/30" />
              <p>Generate or select an audit report log to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
