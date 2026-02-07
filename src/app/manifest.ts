import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CoreCoin Wallet',
    short_name: 'CoreCoin',
    description: 'Secure Crypto Wallet & Exchange',
    start_url: '/dashboard', // When they tap the icon, they go straight to dashboard
    display: 'standalone', // This REMOVES the browser URL bar
    background_color: '#000000',
    theme_color: '#000000',
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