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
  }
};

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
