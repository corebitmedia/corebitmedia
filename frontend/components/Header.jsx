'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

// Every service carries a `navGroup` ('analytics'|'experimentation'|'marketing')
// deciding which top-level mega-menu it belongs under, and `parentId`
// deciding which pillar within that group (see backend/src/models/Service.js).
// Analytics and Experimentation are flat lists (every service in the group
// has no parent, so `children` comes back empty and the dropdown just lists
// them as a single column) — Marketing has 3 real pillars (Paid Media, SEO &
// Organic Growth, Measurement & Attribution) each with their own children,
// rendered as a multi-column mega-menu exactly like the old "Services" menu.
function groupByNavGroup(services, navGroup) {
  const inGroup = services.filter((s) => s.navGroup === navGroup);
  const pillars = inGroup.filter((s) => !s.parentId);
  return pillars.map((p) => ({
    ...p,
    children: inGroup.filter((s) => s.parentId === p.id)
  }));
}

const dropdownWrapStyle = {
  position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
  borderTop: '1px solid var(--border)', boxShadow: '0px 12px 24px rgba(35,35,88,0.12)',
  zIndex: 60
};

// Analytics/Experimentation: a single flat column of links.
function FlatMenu({ items }) {
  if (items.length === 0) return null;
  return (
    <div style={dropdownWrapStyle}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 24px', maxWidth: 320 }}>
        {items.map((item) => (
          <Link key={item.slug} href={`/services/${item.slug}/`} style={{ fontSize: 14, color: 'var(--text)', padding: '6px 0' }}>
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
}

// Marketing: multi-column pillar -> children mega-menu (same layout the
// old single "Services" dropdown used).
function PillarMenu({ pillars, viewAllHref }) {
  if (pillars.length === 0) return null;
  return (
    <div style={dropdownWrapStyle}>
      <div
        className="container"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${pillars.length}, 1fr)`, gap: 28, padding: '32px 24px' }}
      >
        {pillars.map((group) => (
          <div key={group.slug}>
            <Link href={`/services/${group.slug}/`} style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 12 }}>
              {group.title}
            </Link>
            {group.children.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.children.map((child) => (
                  <Link key={child.slug} href={`/services/${child.slug}/`} style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.4 }}>
                    {child.title}
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>{group.shortDescription}</p>
            )}
          </div>
        ))}
      </div>
      {viewAllHref && (
        <div style={{ borderTop: '1px solid var(--border)', textAlign: 'center', padding: '14px 24px' }}>
          <Link href={viewAllHref} style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
            View All Services &raquo;
          </Link>
        </div>
      )}
    </div>
  );
}

const PLAIN_LINKS = [
  { label: 'Industries', href: '/industries/' },
  { label: 'Case Studies', href: '/case-study/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'About', href: '/about-us/' },
  { label: 'Contact', href: '/contact-us/' }
];

export default function Header({ services = [] }) {
  const [openMenu, setOpenMenu] = useState(null); // 'analytics' | 'experimentation' | 'marketing' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);

  const analyticsItems = useMemo(() => groupByNavGroup(services, 'analytics'), [services]);
  const experimentationItems = useMemo(() => groupByNavGroup(services, 'experimentation'), [services]);
  const marketingPillars = useMemo(() => groupByNavGroup(services, 'marketing'), [services]);

  const megaMenus = [
    { key: 'analytics', label: 'Analytics', items: analyticsItems, mode: 'flat' },
    { key: 'experimentation', label: 'Experimentation', items: experimentationItems, mode: 'flat' },
    { key: 'marketing', label: 'Marketing', items: marketingPillars, mode: 'pillar' }
  ];

  return (
    <header style={{ borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, background: 'white', zIndex: 50 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 76, position: 'relative' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://www.corebitmedia.com/media/uploads/2025/07/logo-corebitmedia1-2.png"
            alt="Core Bit Media — Unlocking Your Digital Potential"
            style={{ height: 58, width: 'auto' }}
          />
        </Link>

        <nav className="nav-desktop">
          <Link href="/" className="nav-link" style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Home</Link>

          {megaMenus.map((menu) => (
            <div
              key={menu.key}
              style={{ position: 'static', height: 76, display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setOpenMenu(menu.key)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <Link
                href={menu.mode === 'pillar' ? '/services/' : '#'}
                className="nav-link"
                style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={(e) => { if (menu.mode !== 'pillar') e.preventDefault(); }}
              >
                {menu.label}
                <span style={{ fontSize: 10, marginTop: 2 }}>▾</span>
              </Link>
              {openMenu === menu.key && (
                menu.mode === 'flat'
                  ? <FlatMenu items={menu.items} />
                  : <PillarMenu pillars={menu.items} viewAllHref="/services/" />
              )}
            </div>
          ))}

          {PLAIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link" style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/contact-us/" className="btn btn-secondary header-cta-desktop" style={{ fontSize: 16 }}>Get Free Audit</Link>

        <button
          type="button"
          className="mobile-menu-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span style={{ fontSize: 20, color: 'var(--navy)' }}>{mobileOpen ? '✕' : '☰'}</span>
        </button>

        <div className={`mobile-menu${mobileOpen ? ' open' : ''}`} style={{ overflowY: 'auto' }}>
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            style={{ padding: '12px 8px', fontSize: 15, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
          >
            Home
          </Link>

          {megaMenus.map((menu) => (
            <div key={menu.key}>
              <button
                type="button"
                onClick={() => setMobileSection((v) => (v === menu.key ? null : menu.key))}
                style={{
                  padding: '12px 8px', fontSize: 15, fontWeight: 500, color: 'var(--text)',
                  borderBottom: '1px solid var(--border)', background: 'none', border: 'none',
                  textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer'
                }}
              >
                {menu.label}
                <span style={{ fontSize: 11 }}>{mobileSection === menu.key ? '▴' : '▾'}</span>
              </button>
              {mobileSection === menu.key && (
                <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column' }}>
                  {menu.mode === 'pillar' && (
                    <Link href="/services/" onClick={() => setMobileOpen(false)} style={{ padding: '10px 8px', fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
                      All Services
                    </Link>
                  )}
                  {menu.items.map((item) => (
                    <div key={item.slug}>
                      <Link
                        href={`/services/${item.slug}/`}
                        onClick={() => setMobileOpen(false)}
                        style={{ padding: '10px 8px', fontSize: 14, fontWeight: item.children?.length ? 600 : 400, color: 'var(--text)', display: 'block' }}
                      >
                        {item.title}
                      </Link>
                      {item.children?.length > 0 && (
                        <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column' }}>
                          {item.children.map((child) => (
                            <Link key={child.slug} href={`/services/${child.slug}/`} onClick={() => setMobileOpen(false)} style={{ padding: '8px', fontSize: 13, color: 'var(--muted)' }}>
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {PLAIN_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{ padding: '12px 8px', fontSize: 15, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/contact-us/"
            onClick={() => setMobileOpen(false)}
            className="btn btn-secondary"
            style={{ marginTop: 12, textAlign: 'center', fontSize: 16 }}
          >
            Get Free Audit
          </Link>
        </div>
      </div>
    </header>
  );
}
