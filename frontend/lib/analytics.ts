/**
 * Google Analytics Tracking Utility
 * Measurement ID: G-BZ54WV53Y5
 */

interface EventParams {
  [key: string]: string | number | boolean;
}

/**
 * Track a page view
 */
export function trackPageView(pagePath: string, pageTitle: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-BZ54WV53Y5', {
      page_path: pagePath,
      page_title: pageTitle,
    });
  }
}

/**
 * Track a custom event
 * @param eventName - Event name (e.g., 'photo_uploaded', 'question_answered')
 * @param params - Event parameters
 */
export function trackEvent(eventName: string, params?: EventParams) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/**
 * Track photo upload
 */
export function trackPhotoUpload(category: string, quality: number) {
  trackEvent('photo_uploaded', {
    category,
    quality_score: quality,
  });
}

/**
 * Track Q&A answer submission
 */
export function trackQAAnswer(category: string, answerType: string) {
  trackEvent('qa_answer_submitted', {
    question_category: category,
    answer_type: answerType,
  });
}

/**
 * Track post published
 */
export function trackPostPublished(postType: string, hasImage: boolean) {
  trackEvent('post_published', {
    post_type: postType,
    has_image: hasImage,
  });
}

/**
 * Track business info updated
 */
export function trackBusinessInfoUpdated(fieldName: string) {
  trackEvent('business_info_updated', {
    field: fieldName,
  });
}

/**
 * Track keyword added
 */
export function trackKeywordAdded(keyword: string, difficulty: string) {
  trackEvent('keyword_added', {
    keyword,
    difficulty,
  });
}

/**
 * Track analytics view
 */
export function trackAnalyticsView(reportType: string, dateRange: string) {
  trackEvent('analytics_viewed', {
    report_type: reportType,
    date_range: dateRange,
  });
}

/**
 * Track conversion goal
 */
export function trackConversion(goalName: string, value?: number) {
  trackEvent('conversion', {
    goal: goalName,
    value: value || 0,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(featureName: string, action: string) {
  trackEvent('feature_used', {
    feature: featureName,
    action,
  });
}

/**
 * Track user error
 */
export function trackError(errorName: string, errorMessage: string) {
  trackEvent('error', {
    error_name: errorName,
    error_message: errorMessage,
  });
}

/**
 * Track search
 */
export function trackSearch(searchTerm: string) {
  trackEvent('search', {
    search_term: searchTerm,
  });
}

/**
 * Track report download
 */
export function trackReportDownload(reportType: string) {
  trackEvent('report_downloaded', {
    report_type: reportType,
  });
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
