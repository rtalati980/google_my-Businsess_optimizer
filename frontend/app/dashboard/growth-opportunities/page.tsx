'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Rocket, Loader2 } from 'lucide-react';

interface GrowthOpportunityDto {
  id: string;
  serviceName: string;
  description: string;
  businessProblem: string;
  estimatedImpact: string;
  priority: string;
  estimatedTime: string;
}

/**
 * Premium Growth Opportunities page.
 * Displays a list of recommended services based on the user's audit results.
 */
export default function GrowthOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<GrowthOpportunityDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<GrowthOpportunityDto[]>('/api/growth/opportunities');
        setOpportunities(response.data);
      } catch (err) {
        console.error('Failed to load growth opportunities', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="animate-spin mr-2 h-6 w-6" /> Loading Growth Opportunities...
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Rocket className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="font-medium">No growth opportunities available at the moment.</p>
        <p className="text-sm mt-1">Growth recommendations will appear here once your profile audit is complete.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Growth Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-recommended actions to grow your business</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((op) => (
          <div
            key={op.id}
            className="bg-card rounded-2xl p-5 border border-border hover:border-primary/30 hover:shadow-lg transition-all"
          >
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary mr-3">
                <Rocket className="h-4 w-4" />
              </div>
              <h2 className="text-base font-bold text-foreground">{op.serviceName}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{op.description}</p>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p><span className="font-semibold text-foreground">Problem:</span> {op.businessProblem}</p>
              <p><span className="font-semibold text-foreground">Impact:</span> {op.estimatedImpact}</p>
              <p><span className="font-semibold text-foreground">Priority:</span> {op.priority}</p>
              <p><span className="font-semibold text-foreground">Est. Time:</span> {op.estimatedTime}</p>
            </div>
            <button
              className="mt-4 w-full py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 active:scale-95 transition-all"
              onClick={() => {
                console.log('Selected opportunity', op.id);
              }}
            >
              Explore
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
