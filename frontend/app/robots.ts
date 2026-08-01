import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/callback/',
          '/_next/',
        ],
      },
      {
        // Allow Google Bot & Gemini
        userAgent: ['Googlebot', 'Google-Extended'],
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/callback/',
        ],
      },
      {
        // Allow OpenAI ChatGPT Crawler
        userAgent: ['GPTBot', 'ChatGPT-User'],
        allow: '/',
      },
      {
        // Allow Perplexity AI Crawler
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        // Allow Anthropic Claude Crawler
        userAgent: ['ClaudeBot', 'anthropic-ai'],
        allow: '/',
      },
    ],
    sitemap: 'https://bizlocalpilot.com/sitemap.xml',
    host: 'https://bizlocalpilot.com',
  };
}
