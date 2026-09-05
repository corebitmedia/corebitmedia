'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

// The customer dashboard is its own app shell (see app/dashboard/layout.js)
// with its own sidebar/top bar — the public marketing site's Header/Footer
// would just be double chrome there, so this is the one place that decides
// whether they render at all, keeping Header.jsx/Footer.jsx themselves
// untouched.
export default function SiteChrome({ services, children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) return children;

  return (
    <>
      <Header services={services} />
      {children}
      <Footer />
    </>
  );
}
