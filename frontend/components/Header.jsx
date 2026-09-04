'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about-us/' },
  { label: 'Case Study', href: '/case-study/' },
  { label: 'Blogs', href: '/blogs/' },
  { label: 'Contact Us', href: '/contact-us/' }
];

// Builds the two-level menu (pillar service -> its sub-services) from the
// flat services list fetched once in the root layout, rather than hardcoding
// links here — new services created in the admin automatically show up in
// the nav without a code change.
function groupServices(services) {
  const topLevel = services.filter((s) => !s.parentId);
  return topLevel.map((parent) => ({
    ...parent,
    children: services.filter((s) => s.parentId === parent.id)
  }));
}

export default function Header({ services = [] }) {
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [openMobilePillar, setOpenMobilePillar] = useState(null);

  const serviceGroups = useMemo(() => groupServices(services), [services]);

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
          <Link href="/" className="nav-link" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>Home</Link>
          <Link href="/about-us/" className="nav-link" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>About Us</Link>

          <div
            style={{ position: 'static', height: 76, display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <Link
              href="/services/"
              className="nav-link"
              style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Services
              <span style={{ fontSize: 10, marginTop: 2 }}>▾</span>
            </Link>
            {servicesOpen && serviceGroups.length > 0 && (
              <div
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, background: 'white',
                  borderTop: '1px solid var(--border)', boxShadow: '0px 12px 24px rgba(35,35,88,0.12)',
                  zIndex: 60
                }}
              >
                <div
                  className="container"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${serviceGroups.length}, 1fr)`,
                    gap: 28,
                    padding: '32px 24px'
                  }}
                >
                  {serviceGroups.map((group) => (
                    <div key={group.slug}>
                      <Link
                        href={`/services/${group.slug}/`}
                        style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 12 }}
                      >
                        {group.title}
                      </Link>
                      {group.children.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {group.children.map((child) => (
                            <Link
                              key={child.slug}
                              href={`/services/${child.slug}/`}
                              style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.4 }}
                            >
                              {child.title}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
                          {group.shortDescription}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--border)', textAlign: 'center', padding: '14px 24px' }}>
                  <Link href="/services/" style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
                    View All Services &raquo;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href="/case-study/" className="nav-link" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>Case Study</Link>
          <Link href="/blogs/" className="nav-link" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>Blogs</Link>
          <Link href="/contact-us/" className="nav-link" style={{ fontSize: 16, fontWeight: 500, color: 'var(--text)' }}>Contact Us</Link>
        </nav>

        <div className="header-cta-desktop" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard/signup/" className="btn btn-outline" style={{ fontSize: 15 }}>Free Web Analytics Report</Link>
          <Link href="/contact-us/" className="btn btn-secondary" style={{ fontSize: 16 }}>Get Free Audit</Link>
        </div>

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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              style={{ padding: '12px 8px', fontSize: 15, fontWeight: 500, color: 'var(--text)', borderBottom: '1px solid var(--border)' }}
            >
              {link.label}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setMobileServicesOpen((v) => !v)}
            style={{
              padding: '12px 8px', fontSize: 15, fontWeight: 500, color: 'var(--text)',
              borderBottom: '1px solid var(--border)', background: 'none', border: 'none',
              textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer'
            }}
          >
            Services
            <span style={{ fontSize: 11 }}>{mobileServicesOpen ? '▴' : '▾'}</span>
          </button>
          {mobileServicesOpen && (
            <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column' }}>
              <Link
                href="/services/"
                onClick={() => setMobileOpen(false)}
                style={{ padding: '10px 8px', fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}
              >
                All Services
              </Link>
              {serviceGroups.map((group) => (
                <div key={group.slug}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link
                      href={`/services/${group.slug}/`}
                      onClick={() => setMobileOpen(false)}
                      style={{ padding: '10px 8px', fontSize: 14, fontWeight: 600, color: 'var(--text)', flex: 1 }}
                    >
                      {group.title}
                    </Link>
                    {group.children.length > 0 && (
                      <button
                        type="button"
                        aria-label={`Toggle ${group.title} sub-services`}
                        onClick={() => setOpenMobilePillar((v) => (v === group.slug ? null : group.slug))}
                        style={{ background: 'none', border: 'none', padding: '10px 8px', fontSize: 11, color: 'var(--muted)', cursor: 'pointer' }}
                      >
                        {openMobilePillar === group.slug ? '▴' : '▾'}
                      </button>
                    )}
                  </div>
                  {openMobilePillar === group.slug && (
                    <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column' }}>
                      {group.children.map((child) => (
                        <Link
                          key={child.slug}
                          href={`/services/${child.slug}/`}
                          onClick={() => setMobileOpen(false)}
                          style={{ padding: '8px', fontSize: 13, color: 'var(--muted)' }}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <Link
            href="/dashboard/signup/"
            onClick={() => setMobileOpen(false)}
            className="btn btn-outline"
            style={{ marginTop: 12, textAlign: 'center', fontSize: 15 }}
          >
            Free Web Analytics Report
          </Link>

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
