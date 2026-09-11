'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ContactForm from './ContactForm';

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

// Cross-links to the other two service mega-menus, shown at the bottom of
// every Analytics/Experimentation/Marketing dropdown so a visitor browsing
// one category can jump straight to another without leaving the menu.
const CATEGORY_LINKS = [
  { key: 'analytics', label: 'Analytics', href: '/services/#analytics' },
  { key: 'experimentation', label: 'Experimentation & CRO', href: '/services/#experimentation' },
  { key: 'marketing', label: 'Marketing', href: '/services/#marketing' }
];

function CategoryCrossLinks({ current }) {
  return (
    <div style={{ borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: 24, padding: '12px 24px', flexWrap: 'wrap' }}>
      {CATEGORY_LINKS.map((c) => (
        <Link
          key={c.key}
          href={c.href}
          style={{ fontSize: 13, fontWeight: 700, color: c.key === current ? 'var(--navy)' : 'var(--teal)' }}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

// Analytics/Experimentation/Industries: a single flat column of links.
function FlatMenu({ items, hrefFor, crossLinkKey }) {
  if (items.length === 0) return null;
  return (
    <div style={dropdownWrapStyle}>
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '20px 24px', maxWidth: 320 }}>
        {items.map((item) => (
          <Link key={item.slug} href={hrefFor(item)} style={{ fontSize: 14, color: 'var(--text)', padding: '6px 0' }}>
            {item.title}
          </Link>
        ))}
      </div>
      {crossLinkKey && <CategoryCrossLinks current={crossLinkKey} />}
    </div>
  );
}

// Marketing: multi-column pillar -> children mega-menu (same layout the
// old single "Services" dropdown used).
function PillarMenu({ pillars, viewAllHref, crossLinkKey }) {
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
      {crossLinkKey && <CategoryCrossLinks current={crossLinkKey} />}
    </div>
  );
}

const PLAIN_LINKS = [
  { label: 'Case Studies', href: '/case-study/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'About', href: '/about-us/' },
  { label: 'Contact', href: '/contact-us/' }
];

// A lightweight lead-capture form reachable from every marketing page (the
// header renders everywhere except /dashboard/*) instead of only from
// /contact-us/ — same ContactForm/`/api/contact` pipeline, tagged with a
// distinct `source` so these submissions are identifiable in the leads list.
function FreeAuditModal({ onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(35,35,88,0.55)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'white', borderRadius: 12, maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}
        >
          ✕
        </button>
        <div className="eyebrow">Free Audit</div>
        <h2 style={{ marginBottom: 16 }}>Get Your Free Marketing Audit</h2>
        <ContactForm source="free-audit-modal" />
      </div>
    </div>
  );
}

// Builds the two-level menu (pillar -> its sub-services) from the flat
// services list fetched once in the root layout, rather than hardcoding
// links here — new services created in the admin automatically show up in
// the nav without a code change.
export default function Header({ services = [], industries = [] }) {
  const [openMenu, setOpenMenu] = useState(null); // 'analytics' | 'experimentation' | 'marketing' | 'industries' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);

  const analyticsItems = useMemo(() => groupByNavGroup(services, 'analytics'), [services]);
  const experimentationItems = useMemo(() => groupByNavGroup(services, 'experimentation'), [services]);
  const marketingPillars = useMemo(() => groupByNavGroup(services, 'marketing'), [services]);

  const megaMenus = [
    { key: 'analytics', label: 'Analytics', items: analyticsItems, mode: 'flat', hrefFor: (i) => `/services/${i.slug}/` },
    { key: 'experimentation', label: 'Experimentation', items: experimentationItems, mode: 'flat', hrefFor: (i) => `/services/${i.slug}/` },
    { key: 'marketing', label: 'Marketing', items: marketingPillars, mode: 'pillar' },
    { key: 'industries', label: 'Industries', items: industries, mode: 'flat', hrefFor: (i) => `/industries/${i.slug}/`, viewAllHref: '/industries/', allLabel: 'All Industries' }
  ];

  function openAudit(e) {
    e.preventDefault();
    setMobileOpen(false);
    setAuditOpen(true);
  }

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
                href={menu.mode === 'pillar' ? '/services/' : (menu.viewAllHref || '#')}
                className="nav-link"
                style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={(e) => { if (menu.mode !== 'pillar' && !menu.viewAllHref) e.preventDefault(); }}
              >
                {menu.label}
                <span style={{ fontSize: 10, marginTop: 2 }}>▾</span>
              </Link>
              {openMenu === menu.key && (
                menu.mode === 'flat'
                  ? <FlatMenu items={menu.items} hrefFor={menu.hrefFor} crossLinkKey={menu.key === 'industries' ? null : menu.key} />
                  : <PillarMenu pillars={menu.items} viewAllHref="/services/" crossLinkKey={menu.key} />
              )}
            </div>
          ))}

          {PLAIN_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link" style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>
              {link.label}
            </Link>
          ))}
        </nav>

        <a href="/contact-us/" onClick={openAudit} className="btn btn-secondary header-cta-desktop" style={{ fontSize: 16 }}>Get Free Audit</a>

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
                  {(menu.mode === 'pillar' || menu.viewAllHref) && (
                    <Link href={menu.viewAllHref || '/services/'} onClick={() => setMobileOpen(false)} style={{ padding: '10px 8px', fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
                      {menu.allLabel || 'All Services'}
                    </Link>
                  )}
                  {menu.items.map((item) => (
                    <div key={item.slug}>
                      <Link
                        href={menu.hrefFor ? menu.hrefFor(item) : `/services/${item.slug}/`}
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

          <a
            href="/contact-us/"
            onClick={openAudit}
            className="btn btn-secondary"
            style={{ marginTop: 12, textAlign: 'center', fontSize: 16 }}
          >
            Get Free Audit
          </a>
        </div>
      </div>

      {auditOpen && <FreeAuditModal onClose={() => setAuditOpen(false)} />}
    </header>
  );
}
