import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Corecoin Wallet',
    short_name: 'Corecoin',
    description: 'Secure custodial infrastructure for digital assets.',
    start_url: '/',
    display: 'standalone', // Removes browser UI
    background_color: '#050505',
    theme_color: '#050505',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}