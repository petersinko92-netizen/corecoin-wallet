import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google"; 
import "./globals.css";
import { Toaster } from 'sonner'; 
import { SecurityProvider } from '@/context/SecurityContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" }); 

// 1. VIEWPORT: Fixes Zooming & Notch Issues
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // ⚠️ CRITICAL: Lets content flow behind the notch
  themeColor: "#050505", 
};

// 2. APP METADATA
export const metadata: Metadata = {
  title: "Corecoin | Beyond Digital Assets",
  description: "The secure, custodial standard for the digital economy.",
  manifest: "/manifest.json", 
  icons: {
    // ✅ Browser Tab: Uses your crisp SVG
    icon: '/icon.svg', 
    // ✅ iPhone Home Screen: MUST be PNG (SVG won't work here)
    apple: '/icon-192.png', 
  },
  appleWebApp: {
    capable: true, // Enables "App Mode"
    statusBarStyle: "black-translucent", // Glassy top bar
    title: "CoreCoin",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        suppressHydrationWarning={true}
        // 3. ADD 'pb-safe': Adds padding for the iPhone Home Bar
        className={`${inter.variable} ${outfit.variable} antialiased bg-[#050505] text-white pb-safe`}
      >
        <ThemeProvider>
            <Toaster position="top-center" theme="dark" />
            <SecurityProvider>
               {children}
            </SecurityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}