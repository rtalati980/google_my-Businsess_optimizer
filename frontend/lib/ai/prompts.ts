/**
 * Prompt Engineering for AI-Generated Business Descriptions
 * Dynamic templates that work with any business type
 */

import { DescriptionGeneration } from '@/lib/db/description-generations';

interface PromptConfig {
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
  tone: string;
  cta: string;
  language: string;
  descriptionLength?: 'short' | 'medium' | 'long' | 'extra-long';
}

/**
 * Generate a dynamic business description prompt
 * Works for ANY business type (restaurants, dermatology, salons, etc.)
 */
export function buildDescriptionPrompt(config: PromptConfig, length: 'short' | 'medium' | 'long' | 'extra-long' = 'long'): string {
  const lengthConfig = {
    short: { words: 80, sections: 1, tone: 'concise' },
    medium: { words: 250, sections: 3, tone: 'informative' },
    long: { words: 500, sections: 5, tone: 'comprehensive' },
    'extra-long': { words: 750, sections: 6, tone: 'detailed' },
  };

  const targetLength = lengthConfig[length];
  const wordsPerSection = Math.floor(targetLength.words / targetLength.sections);

  const keywordList = config.keywords.join(', ');
  const servicesText = [config.primaryService, ...config.secondaryServices].join(', ');
  const locationKeywords = `${config.area}, ${config.city}, ${config.state}`;
  const uniquePointsList = config.uniqueSellingPoints.join(', ');

  return `You are a professional SEO copywriter and content strategist.

Write a compelling, SEO-optimized business description for a ${config.businessCategory} business.

BUSINESS INFORMATION:
- Name: ${config.businessName}
- Category: ${config.businessCategory}
- Services: ${servicesText}
- Location: ${locationKeywords}
- Experience: ${config.yearsInBusiness} years in business
- Target Customers: ${config.targetCustomers}
- Unique Selling Points: ${uniquePointsList}

REQUIREMENTS:

**Length & Structure:**
✓ Target: ${targetLength.words}-${targetLength.words + 50} words exactly
✓ Organize into ${targetLength.sections} clear sections
✓ Each section: ${wordsPerSection}-${wordsPerSection + 30} words
✓ Professional yet ${config.tone.toLowerCase()} tone

**SEO Optimization:**
✓ Naturally incorporate these keywords: ${keywordList}
✓ Include location keywords: ${locationKeywords}, ${config.area} ${config.businessCategory}
✓ Use LSI (Latent Semantic Indexing) keywords related to the industry
✓ Answer common customer questions:
  - What services do you offer?
  - Why should customers choose you?
  - What is your experience/expertise?
  - How to contact or book?

**Content Strategy:**
✓ Start with a compelling hook that captures attention
✓ Highlight unique value propositions
✓ Include specific services and specialties
✓ Build trust through years of experience and expertise
✓ Create urgency with call-to-action: ${config.cta}
✓ Use natural language (avoid keyword stuffing)

**Tone & Voice:**
✓ Tone: ${config.tone} (adjust language appropriately)
✓ Keep sentences varied (mix short and long)
✓ Use active voice wherever possible
✓ Be specific (avoid generic phrases like "best in class")

**Format:**
✓ Write paragraph format (not bullet points for main content)
✓ Separate sections with clear paragraph breaks
✓ Make it scannable with short paragraphs
✓ End with a clear call-to-action

**Do NOT:**
✗ Use HTML tags or markdown formatting
✗ Exceed ${targetLength.words + 50} words
✗ Be overly promotional or use excessive punctuation
✗ Include fake claims or unverifiable statements
✗ Use competitor names
✗ Include contact details in the body (mention how to reach out but don't list phone numbers)

WRITE THE DESCRIPTION NOW:`;
}

/**
 * Generate prompt for SEO title (80 characters max)
 */
export function buildTitlePrompt(config: PromptConfig): string {
  return `Create an SEO-optimized Google Business Profile title for:
${config.businessName} - ${config.businessCategory} in ${config.city}, ${config.state}

REQUIREMENTS:
✓ Maximum 80 characters
✓ Include primary keyword: "${config.primaryService}"
✓ Include location: "${config.city}"
✓ Professional tone
✓ No special characters or ALL CAPS
✓ Avoid keyword stuffing

Generate only the title, nothing else.`;
}

/**
 * Generate prompt for keywords extraction
 */
export function buildKeywordExtractionPrompt(config: PromptConfig, description: string): string {
  return `Analyze this business description and extract the most relevant keywords for SEO:

BUSINESS: ${config.businessName} (${config.businessCategory})
LOCATION: ${config.area}, ${config.city}, ${config.state}
DESCRIPTION: ${description}

REQUIREMENTS:
✓ Extract 15-20 high-value keywords
✓ Include location-based keywords
✓ Include service-related keywords
✓ Include long-tail keywords (3+ words)
✓ Focus on search intent keywords
✓ Format: one keyword per line
✓ No duplicates

GUIDELINES:
- Primary keywords: should be high volume, high intent
- Long-tail keywords: should be specific and less competitive
- Location keywords: city name, area name, region
- Service keywords: actual services offered

Provide ONLY the keywords, one per line. No explanations.`;
}

/**
 * Generate prompt for FAQ generation
 */
export function buildFAQPrompt(config: PromptConfig, description: string): string {
  return `Generate 5-7 frequently asked questions (FAQs) that customers would have about this business:

BUSINESS: ${config.businessName} - ${config.businessCategory}
LOCATION: ${config.city}, ${config.state}
DESCRIPTION: ${description}

REQUIREMENTS:
✓ Generate 5-7 Q&A pairs
✓ Questions should be realistic and commonly asked
✓ Answers should be 1-3 sentences each
✓ Answers should be based on the description provided
✓ Include operational questions (hours, pricing, booking, etc.)
✓ Include service quality questions
✓ Format each as: Q: [question]\nA: [answer]

Create FAQs that build trust and answer customer objections.

Provide ONLY the Q&A pairs, no additional text.`;
}

/**
 * Generate prompt for category and service suggestions
 */
export function buildCategorySuggestionPrompt(config: PromptConfig): string {
  return `Suggest relevant business categories and services for:

BUSINESS: ${config.businessName}
PRIMARY CATEGORY: ${config.businessCategory}
PRIMARY SERVICE: ${config.primaryService}
SECONDARY SERVICES: ${config.secondaryServices.join(', ')}
LOCATION: ${config.city}, ${config.state}

REQUIREMENTS:
✓ Suggest 3-5 additional Google Business Profile categories that apply
✓ For each category, suggest 2-3 specific services/attributes
✓ Only suggest realistic and relevant options
✓ Consider the service area (city: ${config.city})

Format as:
Category 1: [name]
  - Service 1
  - Service 2

Provide ONLY the suggestions, no explanations.`;
}

/**
 * Generate prompt for hashtag suggestions
 */
export function buildHashtagPrompt(config: PromptConfig): string {
  const locationHashtags = [
    `#${config.city.replace(/\s+/g, '')}`,
    `#${config.city.replace(/\s+/g, '')}${config.businessCategory.replace(/\s+/g, '')}`,
    `#Near${config.city.replace(/\s+/g, '')}`,
  ];

  return `Generate relevant hashtags for social media marketing:

BUSINESS: ${config.businessName} - ${config.businessCategory}
LOCATION: ${config.area}, ${config.city}, ${config.state}
SERVICES: ${[config.primaryService, ...config.secondaryServices].join(', ')}

REQUIREMENTS:
✓ Generate 15-20 relevant hashtags
✓ Mix of broad and niche hashtags
✓ Include location-based hashtags: ${locationHashtags.join(', ')}
✓ Include industry hashtags
✓ Include trending hashtags (if applicable)
✓ No special characters except #
✓ Lowercase format: #likethis

CATEGORIES:
- Location hashtags (5): #${config.city}businesses, #${config.city}services, etc.
- Industry hashtags (5): Related to ${config.businessCategory}
- Niche hashtags (5): Specific to ${config.primaryService}
- Trending hashtags (5): Popular in the area/industry

Provide ONLY the hashtags, one per line. No explanations.`;
}

/**
 * Generate prompt for quality scoring
 */
export function buildQualityScoringPrompt(config: PromptConfig, description: string): string {
  return `Score the quality of this business description on multiple dimensions:

BUSINESS: ${config.businessName} - ${config.businessCategory}
DESCRIPTION: ${description}

RATE THE DESCRIPTION on these metrics (1-100 scale):

1. **SEO Optimization** (1-100):
   - Does it include relevant keywords?
   - Are location keywords included?
   - Natural keyword placement?

2. **Readability** (1-100):
   - Is it easy to read?
   - Good paragraph structure?
   - Appropriate sentence length?

3. **Keyword Usage** (1-100):
   - Frequency of primary keywords
   - Diversity of keywords
   - No keyword stuffing?

4. **Local SEO** (1-100):
   - Location specificity
   - Local relevance
   - Area coverage

5. **Call-to-Action** (1-100):
   - Clear CTA present?
   - Compelling CTA?
   - Urgency/incentive?

6. **Trust & Credibility** (1-100):
   - Professionalism
   - Experience mentioned?
   - Specific details/proof?

Provide response in this format:
SEO Optimization: [score]
Readability: [score]
Keyword Usage: [score]
Local SEO: [score]
Call-to-Action: [score]
Trust & Credibility: [score]
Overall: [average of all scores]

Provide ONLY the scores and brief explanations. No other text.`;
}

/**
 * Generate prompt for description improvement suggestions
 */
export function buildImprovementPrompt(config: PromptConfig, description: string): string {
  return `Analyze this business description and provide 3-5 specific improvement suggestions:

BUSINESS: ${config.businessName} - ${config.businessCategory}
DESCRIPTION: ${description}

PROVIDE:
✓ 3-5 specific, actionable improvements
✓ Explain WHY each improvement matters
✓ Suggest concrete changes or additions
✓ Prioritize by impact (highest ROI first)

FOCUS ON:
- Missing keywords that should be added
- Sentences that could be more compelling
- Trust signals that could be strengthened
- Call-to-action optimization
- SEO structural improvements

Format each as:
Improvement 1: [Title]
  Why: [explanation]
  Suggestion: [specific change]

Provide ONLY the improvements, no additional text.`;
}
