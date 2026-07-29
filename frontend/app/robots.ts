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
        // Allow Google Bot full access to all public pages
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
          '/callback/',
        ],
      },
      {
        // Allow Bing Bot full access
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/api/',
        ],
      },
    ],
    sitemap: 'https://bizlocalpilot.ai/sitemap.xml',
    host: 'https://bizlocalpilot.ai',
  };
}
