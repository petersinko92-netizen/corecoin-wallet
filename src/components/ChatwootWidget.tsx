"use client";
import { useEffect } from 'react';

export function ChatwootWidget() {
  useEffect(() => {
    // Prevent duplicate loading
    if ((window as any).chatwootSDK) return;

    const BASE_URL = 'https://app.chatwoot.com'; // Or your self-hosted URL
    const WEBSITE_TOKEN = 'YOUR_REAL_WEBSITE_TOKEN_HERE'; // <--- PASTE TOKEN HERE

    (function(d,t) {
      var g=d.createElement(t) as HTMLScriptElement,s=d.getElementsByTagName(t)[0];
      g.src=BASE_URL+"/packs/js/sdk.js";
      g.defer = true;
      g.async = true;
      s.parentNode?.insertBefore(g,s);
      g.onload=function(){
        (window as any).chatwootSDK.run({
          websiteToken: WEBSITE_TOKEN,
          baseUrl: BASE_URL
        });
        // HIDE the default bubble so we can use our custom button
        (window as any).$chatwoot.toggle("hide"); 
      }
    })(document,"script");
  }, []);

  return null; // This component renders nothing visual
}