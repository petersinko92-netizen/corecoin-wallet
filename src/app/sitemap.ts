import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://corecoin.co'; // Your actual domain

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1, // Landing Page is #1
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8, // Login is #2
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8, // Signup is #2
    },
    {
      url: `${baseUrl}/about`, // If you have one
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}