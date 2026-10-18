import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Allow ALL bots (Google, Bing, etc.)
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/rescue/', '/debug/', '/api/'], // ⚠️ Keep Dashboard, Admin, and Internal Tools PRIVATE from search engines
    },
    sitemap: 'https://cryptochains.net/sitemap.xml',
  };
}