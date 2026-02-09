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
              <!-- Start of LiveChat (www.livechat.com) code -->
<script>
    window.__lc = window.__lc || {};
    window.__lc.license = 19497958;
    window.__lc.integration_name = "manual_onboarding";
    window.__lc.product_name = "livechat";
    ;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))
</script>
<noscript><a href="https://www.livechat.com/chat-with/19497958/" rel="nofollow">Chat with us</a>, powered by <a href="https://www.livechat.com/?welcome" rel="noopener nofollow" target="_blank">LiveChat</a></noscript>
<!-- End of LiveChat code -->
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
