'use client'

import Script from 'next/script'

export function LiveChat() {
  return (
    <>
      <Script
        id="smartsupp-chat-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            var _smartsupp = _smartsupp || {};
            _smartsupp.key = 'ec56b724877b272fe2e3241419a5507be992cd7c';
            window.smartsupp||(function(d) {
              var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
              s=d.getElementsByTagName('script')[0];c=d.createElement('script');
              c.type='text/javascript';c.charset='utf-8';c.async=true;
              c.src='https://www.smartsuppchat.com/loader.js?';s.parentNode.insertBefore(c,s);
            })(document);
          `,
        }}
      />
      <noscript>
        Powered by <a href="https://www.smartsupp.com" target="_blank" rel="noopener noreferrer">Smartsupp</a>
      </noscript>
    </>
  )
}