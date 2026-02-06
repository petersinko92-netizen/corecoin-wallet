import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google"; 
import "./globals.css";
import { Toaster } from 'sonner'; 
import { SecurityProvider } from '@/context/SecurityContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" }); 

export const metadata: Metadata = {
  title: "Corecoin | Beyond Digital Assets",
  description: "The secure, custodial standard for the digital economy.",
  icons: {
    icon: '/icon.svg', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning=true fixes the "attribute mismatch" error 
         caused by browser extensions (like password managers) injecting code.
      */}
      <body 
        suppressHydrationWarning={true}
        className={`${inter.variable} ${outfit.variable} antialiased bg-[#050505] text-white`}
      >
        
        {/* 1. Theme Provider (Wraps App to prevent crash) */}
        <ThemeProvider>
            
            {/* 2. Toast Notifications */}
            <Toaster position="top-center" theme="dark" />

            {/* 3. Security Wrapper (Idle Timer) */}
            <SecurityProvider>
               {children}
            </SecurityProvider>

        </ThemeProvider>
        
      </body>
    </html>
  );
}