export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  googleSub?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  status: string;
  planType: string;
  currentPeriodEnd?: string;
}

export interface Business {
  id: string;
  name: string;
  googleAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  googleLocationId: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  category?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface ReviewReply {
  id: string;
  replyText: string;
  isPublished: boolean;
  generatedBy: string;
  tone: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  reviewerName: string;
  reviewerProfilePhoto?: string;
  rating: number;
  comment?: string;
  status: 'UNANSWERED' | 'ANSWERED';
  googleCreatedTime: string;
  createdAt: string;
  reply?: ReviewReply;
}

export interface Post {
  id: string;
  topic?: string;
  content: string;
  mediaUrl?: string;
  postType: 'WEEKLY' | 'FESTIVAL' | 'PROMOTION' | 'PRODUCT';
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED';
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIReport {
  id: string;
  startDate: string;
  endDate: string;
  summary?: string;
  sentimentAnalysis?: string;
  seoRecommendations?: string;
  contentRecommendations?: string;
  growthOpportunities?: string;
  createdAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  postingActivity?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardInsights {
  locationId: string;
  averageRating: number;
  reviewCount: number;
  calls: number;
  websiteClicks: number;
  directionRequests: number;
  searchViews: number;
  mapsViews: number;
  reviewGrowth: {
    month: string;
    reviewsCount: number;
    averageRating: number;
  }[];
  dailyInteractions: {
    day: string;
    calls: number;
    views: number;
    directions: number;
  }[];
}
