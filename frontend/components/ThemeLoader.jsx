'use client';

import { useEffect } from 'react';

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
      })
      .catch(() => {
        // silent fallback to default theme in globals.css
      });
  }, []);

  return null;
}
