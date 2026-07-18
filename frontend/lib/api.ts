import axios from 'axios';
import { 
  User, Business, Location, Review, ReviewReply, 
  Post, AIReport, Competitor, DashboardInsights 
} from './types';

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (typeof window !== 'undefined') {
  console.log('[API] Client-side Resolved Base URL:', API_BASE_URL);
}

// Inject bearer token interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('gmb_auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto-logout on expired/invalid token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('gmb_auth_token');
      document.cookie = 'gmb_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Authentication
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },

  // Businesses & Locations
  getBusinesses: async (): Promise<Business[]> => {
    try {
      const response = await api.get<Business[]>('/api/businesses');
      return response.data;
    } catch (err: any) {
      // Propagate structured error from backend (e.g. quota exceeded)
      const serverMsg = err.response?.data?.error;
      if (serverMsg === 'GMB_API_QUOTA_EXCEEDED') {
        const e = new Error(err.response.data.message) as any;
        e.code = 'GMB_API_QUOTA_EXCEEDED';
        throw e;
      }
      throw err;
    }
  },

  connectGmb: async (): Promise<Business[]> => {
    const response = await api.post<Business[]>('/api/businesses/connect');
    return response.data;
  },

  getLocationDetails: async (locationId: string): Promise<Location> => {
    const response = await api.get<Location>(`/api/locations/${locationId}`);
    return response.data;
  },

  getLocationInsights: async (locationId: string, refresh = false): Promise<DashboardInsights> => {
    const response = await api.get<DashboardInsights>(`/api/locations/${locationId}/insights${refresh ? '?refresh=true' : ''}`);
    return response.data;
  },

  // Reviews
  getReviews: async (
    locationId: string, 
    ratings: number[] = [], 
    page: number = 0, 
    size: number = 10
  ): Promise<{
    content: Review[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
  }> => {
    const params: any = { page, size };
    if (ratings.length > 0) {
      // Spring List<Integer> expects repeated params: ratings=1&ratings=2&ratings=3
      params.ratings = ratings;
    }
    const response = await api.get(`/api/locations/${locationId}/reviews`, {
      params,
      paramsSerializer: (p) => {
        const parts: string[] = [];
        Object.entries(p).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
          } else {
            parts.push(`${key}=${encodeURIComponent(value as any)}`);
          }
        });
        return parts.join('&');
      }
    });
    return response.data;
  },

  syncReviews: async (locationId: string): Promise<void> => {
    await api.post('/api/reviews/sync', null, { params: { locationId } });
  },

  generateReply: async (reviewId: string, tone: string): Promise<ReviewReply> => {
    const response = await api.post<ReviewReply>(`/api/reviews/${reviewId}/reply/generate`, { tone });
    return response.data;
  },

  publishReply: async (replyId: string): Promise<ReviewReply> => {
    const response = await api.post<ReviewReply>(`/api/reviews/replies/${replyId}/publish`);
    return response.data;
  },

  saveReply: async (reviewId: string, replyText: string, tone: string): Promise<ReviewReply> => {
    const response = await api.post<ReviewReply>('/api/reviews/replies/save', { reviewId, replyText, tone });
    return response.data;
  },

  // Posts
  getPosts: async (locationId: string): Promise<Post[]> => {
    const response = await api.get<Post[]>(`/api/locations/${locationId}/posts`);
    return response.data;
  },

  generatePost: async (locationId: string, postType: string, topic?: string, includeImage?: boolean): Promise<Post> => {
    const response = await api.post<Post>(`/api/locations/${locationId}/posts/generate`, { postType, topic, includeImage });
    return response.data;
  },

  updatePost: async (postId: string, content: string, mediaUrl?: string): Promise<Post> => {
    const response = await api.put<Post>(`/api/posts/${postId}`, { content, mediaUrl });
    return response.data;
  },

  publishPost: async (postId: string): Promise<Post> => {
    const response = await api.post<Post>(`/api/posts/${postId}/publish`);
    return response.data;
  },

  // Reports
  getReports: async (locationId: string): Promise<AIReport[]> => {
    const response = await api.get<AIReport[]>(`/api/locations/${locationId}/reports`);
    return response.data;
  },

  generateWeeklyReport: async (locationId: string): Promise<AIReport> => {
    const response = await api.post<AIReport>(`/api/locations/${locationId}/reports/generate`);
    return response.data;
  },

  getReportDetails: async (locationId: string, reportId: string): Promise<AIReport> => {
    const response = await api.get<AIReport>(`/api/locations/${locationId}/reports/${reportId}`);
    return response.data;
  },

  // Competitors
  getCompetitors: async (locationId: string): Promise<Competitor[]> => {
    const response = await api.get<Competitor[]>(`/api/locations/${locationId}/competitors`);
    return response.data;
  },

  addCompetitor: async (locationId: string, name: string): Promise<Competitor> => {
    const response = await api.post<Competitor>(`/api/locations/${locationId}/competitors`, { name });
    return response.data;
  },

  removeCompetitor: async (competitorId: string): Promise<void> => {
    await api.delete(`/api/competitors/${competitorId}`);
  },

  // AI Business Advisor
  getGrowthPlan: async (locationId: string): Promise<{ plan: string; locationId: string }> => {
    const response = await api.get(`/api/advisor/locations/${locationId}/growth-plan`);
    return response.data;
  },

  askAdvisor: async (locationId: string, question: string): Promise<{ answer: string; question: string }> => {
    const response = await api.post(`/api/advisor/locations/${locationId}/ask`, { question });
    return response.data;
  },

  // Sentiment Analytics
  getSentimentAnalysis: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/sentiment`);
    return response.data;
  },

  // Auto-Reply Settings
  getAutoReplySettings: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/auto-reply-settings`);
    return response.data;
  },

  updateAutoReplySettings: async (locationId: string, settings: any): Promise<any> => {
    const response = await api.put(`/api/locations/${locationId}/auto-reply-settings`, settings);
    return response.data;
  },

  // Notification Settings
  getNotificationSettings: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/notification-settings`);
    return response.data;
  },

  updateNotificationSettings: async (locationId: string, settings: any): Promise<any> => {
    const response = await api.put(`/api/locations/${locationId}/notification-settings`, settings);
    return response.data;
  },

  // Review Requests (Auto-Review Generation)
  generateReviewRequests: async (
    locationId: string,
    customers: Array<{ name: string; phone?: string; email?: string }>,
    requestType: string
  ): Promise<any> => {
    const response = await api.post(`/api/locations/${locationId}/review-requests/generate`, {
      customers,
      requestType,
    });
    return response.data;
  },

  sendReviewRequests: async (locationId: string, requestIds: string[]): Promise<any> => {
    const response = await api.post(`/api/locations/${locationId}/review-requests/send`, {
      requestIds,
    });
    return response.data;
  },

  getReviewRequests: async (locationId: string): Promise<any[]> => {
    const response = await api.get(`/api/locations/${locationId}/review-requests`);
    return response.data;
  },

  getReviewRequestStats: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/review-requests/stats`);
    return response.data;
  },

  markReviewRequestCompleted: async (requestId: string): Promise<any> => {
    const response = await api.post(`/api/review-requests/${requestId}/complete`);
    return response.data;
  },

  // SEO-Optimized Posts
  generateOptimizedPost: async (
    locationId: string,
    postType: string,
    topic?: string,
    includeImage?: boolean
  ): Promise<any> => {
    const response = await api.post(`/api/locations/${locationId}/posts/generate-optimized`, {
      postType,
      topic,
      includeImage,
    });
    return response.data;
  },

  getSeoMetrics: async (postId: string): Promise<any> => {
    const response = await api.get(`/api/posts/${postId}/seo-metrics`);
    return response.data;
  },

  // Advanced Analytics
  getDashboardAnalytics: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/analytics/dashboard`);
    return response.data;
  },

  getCustomersList: async (locationId: string): Promise<any[]> => {
    const response = await api.get(`/api/locations/${locationId}/analytics/customers`);
    return response.data;
  },

  getCustomerLtvAnalysis: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/analytics/customer-ltv`);
    return response.data;
  },

  getChurnAnalysis: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/analytics/churn-risk`);
    return response.data;
  },

  getConversionFunnel: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/analytics/conversion-funnel`);
    return response.data;
  },

  getRoiByChannel: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/analytics/roi-by-channel`);
    return response.data;
  },

  getEngagementTrends: async (locationId: string): Promise<any> => {
    const response = await api.get(`/api/locations/${locationId}/analytics/trends`);
    return response.data;
  },

  // Usage Tracking
  getUserUsage: async (): Promise<any> => {
    const response = await api.get('/api/usage');
    return response.data;
  },

  resetMonthlyQuotas: async (): Promise<any> => {
    const response = await api.post('/api/usage/reset-monthly');
    return response.data;
  },
};
export default api;
