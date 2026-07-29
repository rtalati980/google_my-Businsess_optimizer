'use client';

import React, { useEffect } from 'react';
import { X, Zap, Check, ArrowRight, Crown, Rocket, Building2 } from 'lucide-react';

interface Plan {
  name: string;
  price: string;
  period: string;
  badge?: string;
  highlights: string[];
  planKey: string;
  color: string;
  icon: React.ElementType;
}

const PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '₹499',
    period: '/month',
    planKey: 'STARTER',
    color: '#3b82f6',
    icon: Zap,
    highlights: [
      '1 Location',
      '50 AI Review Replies/month',
      'Unlimited AI Post Generation',
      '✅ Publish directly to Google',
      '3 SEO Audits/month',
    ],
  },
  {
    name: 'Growth',
    price: '₹1,499',
    period: '/month',
    badge: '⭐ Most Popular',
    planKey: 'GROWTH',
    color: '#7c3aed',
    icon: Rocket,
    highlights: [
      'Up to 3 Locations',
      '200 AI Review Replies/month',
      'Unlimited Everything',
      '✅ Publish directly to Google',
      'Competitor Tracker',
      'Unlimited SEO Audits',
    ],
  },
  {
    name: 'Agency',
    price: '₹3,999',
    period: '/month',
    planKey: 'AGENCY',
    color: '#d97706',
    icon: Building2,
    highlights: [
      'Unlimited Locations',
      'Unlimited AI Replies',
      'White-label Dashboard',
      '✅ Publish directly to Google',
      'Dedicated Account Manager',
      'Bulk Export Reports',
    ],
  },
];

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  currentUsage?: { used: number; limit: number; feature: string } | null;
  recommendedPlan?: 'STARTER' | 'GROWTH' | 'AGENCY';
  onSelectPlan?: (planKey: string) => void;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  featureName = 'this feature',
  currentUsage = null,
  recommendedPlan = 'STARTER',
  onSelectPlan,
}: UpgradeModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectPlan = (planKey: string) => {
    if (onSelectPlan) {
      onSelectPlan(planKey);
    } else {
      // Default: navigate to billing settings
      window.location.href = `/dashboard/settings?tab=billing&plan=${planKey}`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-white/10 transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div
          className="px-8 pt-8 pb-6 text-center"
          style={{ background: 'linear-gradient(135deg, #6366f120 0%, #7c3aed20 50%, #3b82f620 100%)' }}
        >
          <div className="text-4xl mb-3">🚀</div>
          <h2 className="text-2xl font-black text-foreground mb-2">
            Unlock {featureName}
          </h2>
          {currentUsage ? (
            <p className="text-muted-foreground text-sm">
              You've used{' '}
              <span className="font-bold text-foreground">
                {currentUsage.used}/{currentUsage.limit} {currentUsage.feature}
              </span>{' '}
              this month. Upgrade to continue.
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              This feature requires a paid plan. Choose the plan that fits your business.
            </p>
          )}
        </div>

        {/* Plans */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isRecommended = plan.planKey === recommendedPlan;
            return (
              <div
                key={plan.planKey}
                className="relative rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:scale-[1.02]"
                style={{
                  border: isRecommended
                    ? `2px solid ${plan.color}`
                    : '1px solid var(--border)',
                  background: isRecommended
                    ? `${plan.color}10`
                    : 'var(--secondary)',
                  boxShadow: isRecommended
                    ? `0 0 30px ${plan.color}30`
                    : 'none',
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                    style={{ background: plan.color }}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-xl"
                    style={{ background: `${plan.color}20` }}
                  >
                    <Icon className="h-4 w-4" style={{ color: plan.color }} />
                  </div>
                  <span className="font-bold text-foreground">{plan.name}</span>
                </div>

                <div>
                  <span
                    className="text-3xl font-black"
                    style={{ color: plan.color }}
                  >
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {plan.period}
                  </span>
                </div>

                <ul className="space-y-2 flex-1">
                  {plan.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check
                        className="h-4 w-4 mt-0.5 flex-shrink-0"
                        style={{ color: plan.color }}
                      />
                      {h}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.planKey)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: isRecommended ? plan.color : `${plan.color}20`,
                    color: isRecommended ? '#fff' : plan.color,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = plan.color;
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = isRecommended ? plan.color : `${plan.color}20`;
                    (e.currentTarget as HTMLElement).style.color = isRecommended ? '#fff' : plan.color;
                  }}
                >
                  Get {plan.name}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="pb-6 text-center text-xs text-muted-foreground">
          🔒 Secure payment via Razorpay · Cancel anytime · 7-day money back guarantee
        </div>
      </div>
    </div>
  );
}
