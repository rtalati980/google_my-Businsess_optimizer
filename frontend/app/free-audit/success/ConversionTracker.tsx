'use client';

import { useEffect } from 'react';

/**
 * Conversion Tracking Component
 * Fires on the success page to track form submissions in:
 * - Google Ads (for ROI tracking)
 * - Google Analytics (for funnel analysis)
 */
export default function ConversionTracker() {
  useEffect(() => {
    // Track in Google Ads
    if (typeof window !== 'undefined' && window.gtag) {
      // Standard Google Ads conversion
      window.gtag('event', 'conversion', {
        'send_to': 'AW-YOUR_CONVERSION_ID/YOUR_LABEL', // Replace with your actual ID
        'value': 500,
        'currency': 'INR',
        'transaction_id': `audit_${Date.now()}`,
      });

      // Also track as custom event for analytics
      window.gtag('event', 'audit_form_conversion', {
        'event_category': 'engagement',
        'event_label': 'free_audit_submission',
        'value': 1,
      });

      console.log('✅ Conversion tracked in Google Ads');
    }

    // Log for debugging
    console.log('🔄 Conversion tracking fired on success page');
  }, []);

  // This component renders nothing (just tracks)
  return null;
}
