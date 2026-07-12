'use client';

import React, { useEffect, useState } from 'react';
import { useDashboard } from '../layout';
import { apiService } from '@/lib/api';
import { Competitor } from '@/lib/types';
import { 
  Users, Sparkles, AlertCircle, Loader2, 
  Trash2, Plus, Star, BarChart3, TrendingUp, Check
} from 'lucide-react';

export default function CompetitorsPage() {
  const { selectedLocation } = useDashboard();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const fetchCompetitors = async () => {
    if (!selectedLocation) return;
    try {
      setLoading(true);
      const data = await apiService.getCompetitors(selectedLocation.id);
      setCompetitors(data);
    } catch (err) {
      console.error('Error fetching competitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitors();
  }, [selectedLocation]);

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !selectedLocation) return;
    try {
      setAdding(true);
      await apiService.addCompetitor(selectedLocation.id, name);
      setName('');
      await fetchCompetitors();
    } catch (err) {
      console.error('Error adding competitor:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveCompetitor = async (id: string) => {
    try {
      await apiService.removeCompetitor(id);
      await fetchCompetitors();
    } catch (err) {
      console.error('Error removing competitor:', err);
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Competitor Tracking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track rating levels, reviews volume, and local search postings activity of close competitors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Comparison Card */}
        <div className="lg:col-span-4 order-last lg:order-first space-y-6">
          {/* Add Competitor */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h3 className="text-base font-black mb-4 flex items-center gap-2">
              <Plus className="h-4.5 w-4.5 text-primary" /> Track Competitor
            </h3>

            <form onSubmit={handleAddCompetitor} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Luigi's Pizzeria"
                  className="w-full bg-card border border-border text-xs rounded-xl p-3 focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full flex items-center justify-center gap-1.5 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all text-xs shadow-md shadow-primary/25"
              >
                {adding ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4.5 w-4.5" /> Track Business
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick analysis summary */}
          {competitors.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm bg-gradient-to-br from-violet-500/5 to-primary/5">
              <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider mb-3">
                <TrendingUp className="h-4.5 w-4.5" /> Market Insights
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your profile is ranking <strong className="text-foreground">above average</strong> in review sentiments compared to {competitors.length} competitors. 
                Keep publishing weekly GMB posts to sustain local search momentum.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Comparison Table / List */}
        <div className="lg:col-span-8 order-first lg:order-last">
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-border bg-secondary/10 flex items-center justify-between">
              <h3 className="text-base font-black flex items-center gap-2">
                <BarChart3 className="h-4.5 w-4.5 text-muted-foreground" /> Local Competitor Matrix
              </h3>
              <span className="text-[10px] font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full uppercase tracking-wider">
                Compare list
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto mb-2" /> Loading competitors matrix...
              </div>
            ) : competitors.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No competitors are currently tracked. Add business names in the sidebar.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="p-4">Business Name</th>
                      <th className="p-4">Google Rating</th>
                      <th className="p-4">Total Reviews</th>
                      <th className="p-4">Primary Category</th>
                      <th className="p-4">GMB Posts Freq</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {/* Active User Business Row (Reference point) */}
                    <tr className="bg-primary/5 font-semibold text-foreground">
                      <td className="p-4 flex items-center gap-2">
                        <span className="font-black truncate max-w-[150px]">{selectedLocation.name}</span>
                        <span className="text-[9px] bg-primary text-primary-foreground font-black px-1.5 py-0.5 rounded-full uppercase">
                          You
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-black">
                          <span>4.5</span>
                          <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                        </div>
                      </td>
                      <td className="p-4 font-black">124</td>
                      <td className="p-4 text-muted-foreground">{selectedLocation.category || 'Restaurant'}</td>
                      <td className="p-4 text-primary font-bold">Active (Weekly)</td>
                      <td className="p-4 text-center text-muted-foreground">-</td>
                    </tr>

                    {/* Tracked Competitors Rows */}
                    {competitors.map((comp) => (
                      <tr key={comp.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-4 font-bold text-foreground truncate max-w-[150px]">{comp.name}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <span>{comp.rating}</span>
                            <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{comp.reviewCount}</td>
                        <td className="p-4 text-muted-foreground">{comp.category}</td>
                        <td className="p-4 text-muted-foreground">{comp.postingActivity}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleRemoveCompetitor(comp.id)}
                            className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors"
                            title="Untrack competitor"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
