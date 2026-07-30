'use client';

import { useState } from 'react';
import { Check, Zap, TrendingUp, Crown } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  icon: React.ReactNode;
  popular?: boolean;
  features: string[];
  cta: string;
  description: string;
  color: string;
}

export default function PricingPlans() {
  const [isLoading, setIsLoading] = useState(false);

  const plans: Plan[] = [
    {
      id: 'STARTER',
      name: 'Starter',
      price: 499,
      icon: <Zap className="w-8 h-8" />,
      description: 'Perfect for small businesses just getting started',
      features: [
        '1 Location',
        '50 AI Review Replies/month',
        'Unlimited AI Post Generation',
        'Basic SEO Audit',
        'Publish directly to Google',
        '3 SEO Audits/month',
      ],
      cta: 'Get Started',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'GROWTH',
      name: 'Growth',
      price: 1499,
      icon: <TrendingUp className="w-8 h-8" />,
      popular: true,
      description: 'Best for growing businesses with multiple locations',
      features: [
        'Up to 3 Locations',
        '200 AI Review Replies/month',
        'Unlimited AI Post Generation',
        'Advanced Analytics',
        'Competitor Tracker',
        'Unlimited SEO Audits',
        'Publish directly to Google',
        'Festival Guide with Templates',
      ],
      cta: 'Get Growth',
      color: 'from-purple-500 to-pink-600',
    },
    {
      id: 'AGENCY',
      name: 'Agency',
      price: 3999,
      icon: <Crown className="w-8 h-8" />,
      description: 'Enterprise solution for agencies and large businesses',
      features: [
        'Unlimited Locations',
        'Unlimited AI Replies',
        'Unlimited Everything',
        'White-label Dashboard',
        'Dedicated Account Manager',
        'Bulk Export Reports',
        'Advanced API Access',
        'Priority Support',
      ],
      cta: 'Get Agency',
      color: 'from-orange-500 to-red-600',
    },
  ];

  const handleSubscribe = async (planId: string, planPrice: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planId }),
      });

      const data = await response.json();

      if (data.simulation) {
        alert(`Simulation Mode: ${planId} Plan - ₹${planPrice}/month`);
        window.location.href = '/dashboard';
        return;
      }

      // Open Razorpay modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: 'INR',
        name: 'BizLocalPilot AI',
        description: `${planId} Plan - ₹${planPrice}/month`,
        order_id: data.orderId,
        handler: async (response: any) => {
          await verifyPayment(response, planId);
        },
        prefill: {
          email: localStorage.getItem('user_email') || '',
        },
        theme: {
          color: '#8B5CF6',
        },
      };

      // @ts-ignore
      if (window.Razorpay) {
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay library not loaded. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (response: any, planId: string) => {
    try {
      const verifyResponse = await fetch('/api/subscriptions/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          planType: planId,
        }),
      });

      const result = await verifyResponse.json();
      if (result.success) {
        alert('Payment successful! Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        alert('Payment verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('Payment verification error.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-300">
          Start free and scale as you grow. No credit card required.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
              plan.popular ? 'md:scale-105 md:shadow-2xl' : 'hover:shadow-xl'
            }`}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-10`} />

            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-bl-xl font-bold text-sm">
                ⭐ Most Popular
              </div>
            )}

            {/* Card Content */}
            <div className="relative bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 h-full flex flex-col">
              {/* Icon */}
              <div className={`inline-flex w-14 h-14 bg-gradient-to-br ${plan.color} rounded-xl items-center justify-center text-white mb-4`}>
                {plan.icon}
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">₹{plan.price}</span>
                <span className="text-gray-400 ml-2">/month</span>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(plan.id, plan.price)}
                disabled={isLoading}
                className={`w-full py-3 rounded-lg font-semibold mb-6 transition-all duration-200 ${
                  plan.popular
                    ? `bg-gradient-to-r ${plan.color} text-white hover:shadow-lg`
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? 'Processing...' : plan.cta}
              </button>

              {/* Features */}
              <div className="space-y-3 flex-1">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-gray-400">
          💳 Secure payment via Razorpay • 🔒 Cancel anytime • 📞 Support 24/7
        </p>
      </div>

      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  );
}
