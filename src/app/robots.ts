import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Allow ALL bots (Google, Bing, etc.)
      allow: '/',
      disallow: ['/dashboard/', '/admin/'], // ⚠️ Keep Dashboard & Admin PRIVATE from Google
    },
    sitemap: 'https://corecoin.co/sitemap.xml',
  };
}