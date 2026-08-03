/**
 * POST /api/generate-description
 * Generates AI-powered business descriptions
 * Requires authentication token
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateWithAI } from '@/lib/ai/providers';
import {
  buildDescriptionPrompt,
  buildTitlePrompt,
  buildKeywordExtractionPrompt,
  buildFAQPrompt,
  buildCategorySuggestionPrompt,
  buildHashtagPrompt,
  buildQualityScoringPrompt,
} from '@/lib/ai/prompts';
import { createDescriptionGeneration, DescriptionGeneration } from '@/lib/db/description-generations';

interface GenerationRequest {
  businessName: string;
  businessCategory: string;
  primaryService: string;
  secondaryServices: string[];
  city: string;
  area: string;
  state: string;
  targetCustomers: string;
  yearsInBusiness: number;
  uniqueSellingPoints: string[];
  keywords: string[];
  tone: 'Friendly' | 'Professional' | 'Luxury' | 'Premium' | 'Modern' | 'Local' | 'Family';
  cta: 'Call Now' | 'Book Today' | 'Visit Us' | 'Schedule Appointment' | 'Website' | 'None';
  language: 'English' | 'Hindi';
  includeShort?: boolean; // 80 words
  includeMedium?: boolean; // 250 words
  includeLong?: boolean; // 500 words (default)
  includeExtraLong?: boolean; // 750 words
}

// Rate limiting: simple in-memory store (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (userLimit.count >= 10) {
    // 10 requests per minute
    return false;
  }

  userLimit.count++;
  return true;
}

function validateRequest(body: unknown): {
  valid: boolean;
  errors: string[];
  data?: GenerationRequest;
} {
  const errors: string[] = [];
  const data = body as GenerationRequest;

  // Required fields
  if (!data.businessName?.trim()) errors.push('Business name is required');
  if (!data.businessCategory?.trim()) errors.push('Business category is required');
  if (!data.primaryService?.trim()) errors.push('Primary service is required');
  if (!data.city?.trim()) errors.push('City is required');
  if (!data.area?.trim()) errors.push('Area is required');
  if (!data.state?.trim()) errors.push('State is required');
  if (!data.targetCustomers?.trim()) errors.push('Target customers description is required');
  if (data.yearsInBusiness < 0) errors.push('Years in business must be >= 0');
  if (!data.tone) errors.push('Tone is required');
  if (!data.cta) errors.push('Call-to-action is required');
  if (!data.language) errors.push('Language is required');

  // Validate arrays
  if (!Array.isArray(data.secondaryServices)) data.secondaryServices = [];
  if (!Array.isArray(data.keywords)) data.keywords = [];
  if (!Array.isArray(data.uniqueSellingPoints)) data.uniqueSellingPoints = [];

  // Set defaults
  if (data.includeShort === undefined) data.includeShort = false;
  if (data.includeMedium === undefined) data.includeMedium = false;
  if (data.includeLong === undefined) data.includeLong = true;
  if (data.includeExtraLong === undefined) data.includeExtraLong = false;

  return {
    valid: errors.length === 0,
    errors,
    data: errors.length === 0 ? data : undefined,
  };
}

async function generateDescriptions(
  config: GenerationRequest
): Promise<{
  seoTitle?: string;
  shortDescription?: string;
  mediumDescription?: string;
  longDescription?: string;
  extraLongDescription?: string;
  topKeywordsUsed?: string[];
  suggestedCategories?: string[];
  suggestedFaqs?: string[];
  suggestedHashtags?: string[];
  qualityMetrics?: Record<string, number>;
}> {
  const results: any = {};

  try {
    // Generate SEO title
    const titlePrompt = buildTitlePrompt(config);
    const titleResponse = await generateWithAI(titlePrompt, { maxTokens: 150 });
    results.seoTitle = titleResponse.text.trim();

    // Generate descriptions by length
    if (config.includeShort) {
      const shortPrompt = buildDescriptionPrompt(config, 'short');
      const shortResponse = await generateWithAI(shortPrompt, { maxTokens: 150 });
      results.shortDescription = shortResponse.text.trim();
    }

    if (config.includeMedium) {
      const mediumPrompt = buildDescriptionPrompt(config, 'medium');
      const mediumResponse = await generateWithAI(mediumPrompt, { maxTokens: 500 });
      results.mediumDescription = mediumResponse.text.trim();
    }

    if (config.includeLong) {
      const longPrompt = buildDescriptionPrompt(config, 'long');
      const longResponse = await generateWithAI(longPrompt, { maxTokens: 800 });
      results.longDescription = longResponse.text.trim();
    }

    if (config.includeExtraLong) {
      const extraLongPrompt = buildDescriptionPrompt(config, 'extra-long');
      const extraLongResponse = await generateWithAI(extraLongPrompt, { maxTokens: 1200 });
      results.extraLongDescription = extraLongResponse.text.trim();
    }

    // Use the long description as the primary for analysis
    const primaryDescription = results.longDescription || results.mediumDescription || results.shortDescription;

    if (primaryDescription) {
      // Extract keywords
      const keywordPrompt = buildKeywordExtractionPrompt(config, primaryDescription);
      const keywordResponse = await generateWithAI(keywordPrompt, { maxTokens: 300 });
      results.topKeywordsUsed = keywordResponse.text
        .split('\n')
        .filter((k: string) => k.trim())
        .slice(0, 20);

      // Generate FAQs
      const faqPrompt = buildFAQPrompt(config, primaryDescription);
      const faqResponse = await generateWithAI(faqPrompt, { maxTokens: 500 });
      results.suggestedFaqs = parseFAQResponse(faqResponse.text);

      // Generate categories
      const categoryPrompt = buildCategorySuggestionPrompt(config);
      const categoryResponse = await generateWithAI(categoryPrompt, { maxTokens: 300 });
      results.suggestedCategories = parseCategoryResponse(categoryResponse.text);

      // Generate hashtags
      const hashtagPrompt = buildHashtagPrompt(config);
      const hashtagResponse = await generateWithAI(hashtagPrompt, { maxTokens: 300 });
      results.suggestedHashtags = hashtagResponse.text
        .split('\n')
        .filter((h: string) => h.trim())
        .slice(0, 20);

      // Calculate quality metrics
      const qualityPrompt = buildQualityScoringPrompt(config, primaryDescription);
      const qualityResponse = await generateWithAI(qualityPrompt, { maxTokens: 400 });
      results.qualityMetrics = parseQualityScore(qualityResponse.text);
    }

    return results;
  } catch (error) {
    console.error('Error generating descriptions:', error);
    throw error;
  }
}

function parseFAQResponse(text: string): string[] {
  return text
    .split('Q:')
    .slice(1)
    .map((item: string) => `Q:${item}`)
    .filter((item: string) => item.includes('A:'))
    .slice(0, 7);
}

function parseCategoryResponse(text: string): string[] {
  return text
    .split('\n')
    .filter((line: string) => !line.includes('-') && line.trim())
    .map((line: string) => line.replace(/^[\d.]\s+/, '').trim())
    .filter((line: string) => line.length > 0)
    .slice(0, 5);
}

function parseQualityScore(text: string): Record<string, number> {
  const metrics: Record<string, number> = {
    seo: 0,
    readability: 0,
    keywordUsage: 0,
    localSeo: 0,
    cta: 0,
    trustSignals: 0,
  };

  const lines = text.split('\n');
  const scoreMap: Record<string, string> = {
    'seo optimization': 'seo',
    'readability': 'readability',
    'keyword usage': 'keywordUsage',
    'local seo': 'localSeo',
    'call-to-action': 'cta',
    'trust & credibility': 'trustSignals',
  };

  lines.forEach((line: string) => {
    Object.entries(scoreMap).forEach(([key, metricKey]) => {
      if (line.toLowerCase().includes(key)) {
        const match = line.match(/(\d+)/);
        if (match) {
          metrics[metricKey] = parseInt(match[1]);
        }
      }
    });
  });

  // Calculate overall quality score (average)
  const scores = Object.values(metrics).filter((s: number) => s > 0);
  if (scores.length > 0) {
    metrics.overall = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
  }

  return metrics;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      );
    }

    // Check if AI provider is configured
    if (!process.env.AI_PROVIDER || !process.env.AI_API_KEY) {
      console.error('❌ AI Configuration Error:', {
        AI_PROVIDER: process.env.AI_PROVIDER ? '✅ Set' : '❌ Missing',
        AI_API_KEY: process.env.AI_API_KEY ? '✅ Set' : '❌ Missing',
      });
      return NextResponse.json(
        {
          error: 'AI service not configured. Please contact support.',
          details: 'Missing AI_PROVIDER or AI_API_KEY in environment'
        },
        { status: 503 }
      );
    }

    // In production, verify JWT token here
    // For now, we'll extract userId from token (implementation depends on your auth system)
    // This is a simplified version - implement proper JWT verification

    const userId = token; // In production: decode JWT and extract userId

    // Check rate limit
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 10 requests per minute.' },
        { status: 429 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Generate descriptions
    const descriptions = await generateDescriptions(validation.data!);

    // Save to database
    const record = await createDescriptionGeneration({
      userId,
      businessName: validation.data!.businessName,
      businessCategory: validation.data!.businessCategory,
      primaryService: validation.data!.primaryService,
      secondaryServices: validation.data!.secondaryServices,
      city: validation.data!.city,
      area: validation.data!.area,
      state: validation.data!.state,
      targetCustomers: validation.data!.targetCustomers,
      yearsInBusiness: validation.data!.yearsInBusiness,
      uniqueSellingPoints: validation.data!.uniqueSellingPoints,
      keywords: validation.data!.keywords,
      tone: validation.data!.tone,
      cta: validation.data!.cta,
      language: validation.data!.language,
      seoTitle: descriptions.seoTitle,
      shortDescription: descriptions.shortDescription,
      mediumDescription: descriptions.mediumDescription,
      longDescription: descriptions.longDescription,
      extraLongDescription: descriptions.extraLongDescription,
      topKeywordsUsed: descriptions.topKeywordsUsed,
      suggestedCategories: descriptions.suggestedCategories,
      suggestedFaqs: descriptions.suggestedFaqs,
      suggestedHashtags: descriptions.suggestedHashtags,
      qualityMetrics: descriptions.qualityMetrics as any,
      qualityScore: descriptions.qualityMetrics?.overall || 0,
    });

    return NextResponse.json(
      {
        success: true,
        id: record._id,
        descriptions: {
          title: descriptions.seoTitle,
          short: descriptions.shortDescription,
          medium: descriptions.mediumDescription,
          long: descriptions.longDescription,
          extraLong: descriptions.extraLongDescription,
        },
        analysis: {
          keywords: descriptions.topKeywordsUsed,
          categories: descriptions.suggestedCategories,
          faqs: descriptions.suggestedFaqs,
          hashtags: descriptions.suggestedHashtags,
          quality: descriptions.qualityMetrics,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in generate-description API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's an API error from AI provider
    if (errorMessage.includes('API error')) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate descriptions', details: errorMessage },
      { status: 500 }
    );
  }
}
