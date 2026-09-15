import './globals.css';
import SiteChrome from '../components/SiteChrome';
import ThemeLoader from '../components/ThemeLoader';
import { getServices, getIndustries, getSiteSettings } from '../lib/api';

// Search Console's HTML-tag ownership check fetches the page's raw HTML —
// it does not execute JavaScript — so the verification meta tag has to be
// baked into the static export at build time, not injected client-side
// like the theme colors/GTM/CMP scripts ThemeLoader.jsx handles (those are
// fine client-side; nothing external re-fetches raw HTML looking for them).
// This means changing the code in the admin panel's Scripts page requires a
// fresh Vercel build to actually take effect, unlike everything else there.
export async function generateMetadata() {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL('https://www.corebitmedia.com'),
    title: {
      default: 'Core Bit Media | Where Marketing Meets Intelligence',
      template: '%s | Core Bit Media'
    },
    description: 'Strategic digital marketing for scalable growth — SEO, PPC, analytics, dashboards, and CRM marketing from Core Bit Media.',
    alternates: {
      canonical: '/'
    },
    icons: {
      icon: 'https://www.corebitmedia.com/media/uploads/2025/06/favicon.png',
      apple: 'https://www.corebitmedia.com/media/uploads/2025/06/favicon.png'
    },
    openGraph: {
      siteName: 'Core Bit Media',
      type: 'website',
      images: ['https://www.corebitmedia.com/media/uploads/2025/07/logo-corebitmedia1-2.png']
    },
    twitter: {
      card: 'summary_large_image'
    },
    ...(settings?.googleSiteVerification ? { verification: { google: settings.googleSiteVerification } } : {})
  };
}

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Core Bit Media',
  url: 'https://www.corebitmedia.com',
  logo: 'https://www.corebitmedia.com/media/uploads/2025/07/logo-corebitmedia1-2.png',
  description: '10+ years of expertise delivering customized digital marketing and analytics services.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Bestech Business Tower, Sector 66',
    addressLocality: 'Sahibzada Ajit Singh Nagar',
    addressRegion: 'Punjab',
    postalCode: '160055',
    addressCountry: 'IN'
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: 'sales@corebitmedia.com'
  },
  sameAs: [
    'https://www.facebook.com/OfficialCoreBitMedia',
    'https://www.instagram.com/corebitmedia/',
    'https://www.linkedin.com/company/corebitmedia'
  ]
};

export default async function RootLayout({ children }) {
  const [services, industries] = await Promise.all([getServices(), getIndustries()]);

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <ThemeLoader />
        <SiteChrome services={services} industries={industries}>{children}</SiteChrome>
      </body>
    </html>
  );
}
