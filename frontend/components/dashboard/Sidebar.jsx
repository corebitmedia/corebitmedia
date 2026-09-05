'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'My Properties', href: '/dashboard/', match: (p) => p === '/dashboard/' },
  { label: 'Reports', href: '/dashboard/reports/', match: (p) => p.startsWith('/dashboard/reports') },
  { label: 'Account', href: '/dashboard/account/', match: (p) => p.startsWith('/dashboard/account') }
];

export default function Sidebar() {
  const pathname = usePathname() || '';

  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '16px 12px' }}>
      {NAV_ITEMS.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: active ? 700 : 500,
              color: active ? 'white' : 'var(--navy)',
              background: active ? 'var(--navy)' : 'transparent'
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
