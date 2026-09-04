'use client';

import { useEffect } from 'react';

// Setting innerHTML doesn't execute embedded <script> tags (browsers block
// that for security), so raw third-party snippets (CMP scripts etc.) have
// to be parsed and their <script>/<meta>/<noscript> elements re-created
// manually to actually run.
function injectRawHtml(html, target) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  Array.from(doc.head.childNodes).concat(Array.from(doc.body.childNodes)).forEach((node) => {
    if (node.nodeType !== 1) return; // skip stray text nodes
    const clone = document.createElement(node.tagName);
    Array.from(node.attributes || []).forEach((attr) => clone.setAttribute(attr.name, attr.value));
    clone.textContent = node.textContent;
    target.appendChild(clone);
  });
}

let scriptsInjected = false; // guards against double-injection on client-side navigations

// Fetches the current theme from the CMS and applies it as CSS custom
// properties on :root. Runs client-side so theme changes made in the admin
// panel show up on the live static site immediately, without a rebuild.
// Falls back silently to the CSS defaults in globals.css if the API is
// unreachable (e.g. backend temporarily down).
export default function ThemeLoader() {
  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiBase) return;

    fetch(`${apiBase}/api/settings/theme`)
      .then((res) => (res.ok ? res.json() : null))
      .then((theme) => {
        if (!theme) return;
        const root = document.documentElement.style;
        if (theme.primaryColor) root.setProperty('--teal', theme.primaryColor);
        if (theme.primaryColorDark) root.setProperty('--teal-dark', theme.primaryColorDark);
        if (theme.secondaryColor) root.setProperty('--navy', theme.secondaryColor);
        if (theme.textColor) root.setProperty('--text', theme.textColor);
        if (theme.mutedColor) root.setProperty('--muted', theme.mutedColor);
        if (theme.backgroundColor) root.setProperty('--bg', theme.backgroundColor);
        if (theme.backgroundAltColor) root.setProperty('--bg-alt', theme.backgroundAltColor);
        if (theme.fontFamily) document.body.style.fontFamily = theme.fontFamily;

        if (theme.siteName) {
          document.querySelectorAll('[data-site-name]').forEach((el) => {
            el.textContent = theme.siteName;
          });
        }
        if (theme.logoUrl) {
          document.querySelectorAll('[data-site-logo]').forEach((el) => {
            el.setAttribute('src', theme.logoUrl.startsWith('http') ? theme.logoUrl : `${apiBase}${theme.logoUrl}`);
          });
        }

        if (scriptsInjected) return; // static export navigations don't remount this component, but guard anyway
        scriptsInjected = true;

        if (theme.googleSiteVerification) {
          const meta = document.createElement('meta');
          meta.name = 'google-site-verification';
          meta.content = theme.googleSiteVerification;
          document.head.appendChild(meta);
        }

        if (theme.gtmContainerId) {
          const id = theme.gtmContainerId;
          const gtmScript = document.createElement('script');
          gtmScript.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
          document.head.appendChild(gtmScript);

          const noscript = document.createElement('noscript');
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.googletagmanager.com/ns.html?id=${id}`;
          iframe.height = '0';
          iframe.width = '0';
          iframe.style.display = 'none';
          iframe.style.visibility = 'hidden';
          noscript.appendChild(iframe);
          document.body.insertBefore(noscript, document.body.firstChild);
        }

        if (theme.cmpScript) injectRawHtml(theme.cmpScript, document.head);
        if (theme.customHeadScript) injectRawHtml(theme.customHeadScript, document.head);
      })
      .catch(() => {
        // silent fallback to default theme in globals.css
      });
  }, []);

  return null;
}
