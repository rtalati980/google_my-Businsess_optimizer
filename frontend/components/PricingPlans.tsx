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

  const getApiUrl = () => {
    return process.env.NEXT_PUBLIC_API_URL || 'https://api.bizlocalpilot.com';
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId: string, planPrice: number) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gmb_auth_token') : null;
    if (!token) {
      alert('Please sign in to choose a subscription plan.');
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Please check your internet connection.');
        setIsLoading(false);
        return;
      }

      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/subscriptions/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ planType: planId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create payment order');
      }

      const data = await response.json();
      const { orderId, amount, currency, keyId, simulation } = data;

      if (simulation) {
        const verifyRes = await fetch(`${apiUrl}/api/subscriptions/razorpay/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            orderId: orderId,
            planType: planId,
          }),
        });

        if (verifyRes.ok) {
          alert(`Successfully subscribed to ${planId} Plan (Demo Mode)!`);
          window.location.href = '/dashboard';
        } else {
          alert('Demo payment verification failed.');
        }
        return;
      }

      // Open Razorpay modal
      const options = {
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'BizLocalPilot AI',
        description: `${planId} Plan - ₹${planPrice}/month`,
        order_id: orderId,
        handler: async (paymentResponse: any) => {
          await verifyPayment(paymentResponse, planId, token, apiUrl);
        },
        prefill: {
          email: localStorage.getItem('user_email') || '',
        },
        theme: {
          color: '#8B5CF6',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      alert(error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPayment = async (response: any, planId: string, token: string, apiUrl: string) => {
    try {
      const verifyResponse = await fetch(`${apiUrl}/api/subscriptions/razorpay/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          planType: planId,
        }),
      });

      const result = await verifyResponse.json();
      if (verifyResponse.ok && result.success !== false) {
        alert('Payment successful! Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        alert(result.error || 'Payment verification failed. Please contact support.');
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
