// Bootstrap first, then our own globals.css — that import order means any
// class name our CSS shares with Bootstrap (e.g. .container) resolves in our
// favor, since equal-specificity rules cascade by source order.
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ThemeLoader from '../components/ThemeLoader';
import { getServices } from '../lib/api';

export const metadata = {
  metadataBase: new URL('https://www.corebitmedia.com'),
  title: {
    default: 'Core Bit Media | Where Marketing Meets Intelligence',
    template: '%s | Core Bit Media'
  },
  description: 'Strategic digital marketing for scalable growth — SEO, PPC, analytics, dashboards, and CRM marketing from Core Bit Media.',
  openGraph: {
    siteName: 'Core Bit Media',
    type: 'website'
  }
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Core Bit Media',
  url: 'https://www.corebitmedia.com',
  logo: 'https://www.corebitmedia.com/wp-content/uploads/2025/07/logo-corebitmedia1-2.png',
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
    telephone: '+91-89686-61985',
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
  const services = await getServices();

  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <ThemeLoader />
        <Header services={services} />
        {children}
        <Footer />
      </body>
    </html>
  );
}
