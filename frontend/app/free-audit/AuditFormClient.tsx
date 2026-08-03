'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

interface FormState {
  business_name: string;
  email: string;
  phone: string;
  business_type: string;
  city: string;
  gmb_url: string;
  consent: boolean;
}

interface FormErrors {
  [key: string]: string;
}

export default function AuditFormClient() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>({
    business_name: '',
    email: '',
    phone: '',
    business_type: '',
    city: '',
    gmb_url: '',
    consent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.business_type) {
      newErrors.business_type = 'Business type is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must consent to receive audit results';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      const response = await fetch('/api/audit-form', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      // Track event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'audit_form_submission', {
          'email': formData.email,
          'business_type': formData.business_type,
          'city': formData.city,
        });
      }

      // Redirect to success page
      router.push('/free-audit/success');
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit your request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-violet-100 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {submitError}
          </div>
        )}

        {/* Business Name */}
        <div>
          <label htmlFor="business_name" className="block text-sm font-bold text-gray-900 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            id="business_name"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            placeholder="e.g., The Italian Kitchen"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
              errors.business_name ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.business_name && (
            <p className="text-red-600 text-xs mt-1">{errors.business_name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
          <p className="text-xs text-gray-500 mt-1">We'll send your audit results here (and never spam you)</p>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
          <p className="text-xs text-gray-500 mt-1">For WhatsApp follow-up if you'd like</p>
        </div>

        {/* Business Type */}
        <div>
          <label htmlFor="business_type" className="block text-sm font-bold text-gray-900 mb-2">
            Business Type *
          </label>
          <select
            id="business_type"
            name="business_type"
            value={formData.business_type}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-gray-900 ${
              errors.business_type ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Select your business type...</option>
            <option value="restaurant">Restaurant / Café</option>
            <option value="salon">Salon / Spa</option>
            <option value="clinic">Medical Clinic / Doctor</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="retail">Retail Shop</option>
            <option value="gym">Gym / Fitness</option>
            <option value="coaching">Coaching Institute</option>
            <option value="hotel">Hotel / Lodging</option>
            <option value="automotive">Automotive / Garage</option>
            <option value="other">Other</option>
          </select>
          {errors.business_type && (
            <p className="text-red-600 text-xs mt-1">{errors.business_type}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label htmlFor="city" className="block text-sm font-bold text-gray-900 mb-2">
            Your City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g., Mumbai, Bangalore, Delhi"
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-gray-900 placeholder:text-gray-400 ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
        </div>

        {/* Google Business Profile URL (optional) */}
        <div>
          <label htmlFor="gmb_url" className="block text-sm font-bold text-gray-900 mb-2">
            Your Google Business Profile URL (optional)
          </label>
          <input
            type="url"
            id="gmb_url"
            name="gmb_url"
            value={formData.gmb_url}
            onChange={handleChange}
            placeholder="https://maps.google.com/maps/place/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-transparent text-gray-900 placeholder:text-gray-400"
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">Helps us give you a more accurate audit</p>
        </div>

        {/* Consent */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="consent"
            name="consent"
            checked={formData.consent}
            onChange={handleChange}
            className="h-4 w-4 text-violet-600 border-gray-300 rounded focus:ring-violet-600 mt-1 flex-shrink-0"
            disabled={isSubmitting}
          />
          <label htmlFor="consent" className="text-sm text-gray-600">
            I agree to receive my audit results and occasional updates about BizLocalPilot AI. I can unsubscribe anytime.
          </label>
        </div>
        {errors.consent && <p className="text-red-600 text-xs">{errors.consent}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-violet-200 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </>
          ) : (
            <>
              Send Me My Free Audit
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Takes 5 minutes. We'll email your results within 24 hours.
        </p>
      </form>
    </div>
  );
}
