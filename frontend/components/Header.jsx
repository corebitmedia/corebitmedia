'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import ContactForm from './ContactForm';

// The 6 top-level "Services" mega-menu columns, matching the business's own
// service-catalog taxonomy exactly (see
// backend/src/scripts/restructureSixCategories.js). Every service carries a
// `navGroup` deciding which column it belongs under, and `parentId`
// deciding which pillar within that group (see backend/src/models/Service.js).
// Every group has exactly one pillar EXCEPT 'analytics', which nests two
// (Analytics Services + Experimentation & CRO, kept as its own real page
// rather than merged away) — groupByNavGroup below handles both shapes
// generically, so ServicesMegaMenu doesn't special-case any one column.
const SERVICE_CATEGORIES = [
  { key: 'analytics', label: 'Analytics' },
  { key: 'reporting', label: 'Reporting & Data' },
  { key: 'conversion-tracking', label: 'Conversion & Tracking' },
  { key: 'paid-advertising', label: 'Paid Advertising' },
  { key: 'seo-aeo', label: 'SEO & AI Discovery' },
  { key: 'webdev', label: 'Web & App Dev' }
];

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
const columnHeaderStyle = { fontSize: 14.5, fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 12 };
const childLinkStyle = { fontSize: 13, color: 'var(--muted)', lineHeight: 1.4 };

// Industries: a single flat column of links (no pillar/children structure).
function FlatMenu({ items, hrefFor }) {
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
    </div>
  );
}

// One mega-menu column. A single-pillar group (5 of the 6) shows the
// group's own page as the header, with that pillar's children flat below —
// same as the old Analytics/Experimentation/Web&App Dev columns. A
// multi-pillar group (just Analytics, nesting Experimentation & CRO) shows
// a generic header linking to the overview page, then a sub-header + child
// list per pillar — same as the old Marketing column used to.
function ServicesMegaMenuColumn({ group }) {
  const isSingle = group.pillars.length === 1;
  const headerHref = isSingle ? `/services/${group.pillars[0].slug}/` : '/services/';

  return (
    <div>
      <Link href={headerHref} style={columnHeaderStyle}>{group.label}</Link>
      <div style={{ display: 'flex', flexDirection: 'column', gap: isSingle ? 8 : 16 }}>
        {isSingle
          ? (group.pillars[0]?.children || []).map((child) => (
              <Link key={child.slug} href={`/services/${child.slug}/`} style={childLinkStyle}>{child.title}</Link>
            ))
          : group.pillars.map((pillar) => (
              <div key={pillar.slug}>
                <Link href={`/services/${pillar.slug}/`} style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>
                  {pillar.title}
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {pillar.children.map((child) => (
                    <Link key={child.slug} href={`/services/${child.slug}/`} style={childLinkStyle}>{child.title}</Link>
                  ))}
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}

function ServicesMegaMenu({ groups }) {
  const hasContent = groups.some((g) => g.pillars.length > 0);
  if (!hasContent) return null;

  return (
    <div style={dropdownWrapStyle}>
      <div
        className="container"
        style={{ maxWidth: 1400, display: 'grid', gridTemplateColumns: `repeat(${groups.length}, 1fr)`, gap: 20, padding: '32px 20px', maxHeight: '75vh', overflowY: 'auto' }}
      >
        {groups.map((group) => <ServicesMegaMenuColumn key={group.key} group={group} />)}
      </div>
      <div style={{ borderTop: '1px solid var(--border)', textAlign: 'center', padding: '14px 24px' }}>
        <Link href="/services/" style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
          View All Services &raquo;
        </Link>
      </div>
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

export default function Header({ services = [], industries = [] }) {
  const [openMenu, setOpenMenu] = useState(null); // 'services' | 'industries' | null
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null);
  const [auditOpen, setAuditOpen] = useState(false);

  const serviceGroups = useMemo(
    () => SERVICE_CATEGORIES.map((cat) => ({ ...cat, pillars: groupByNavGroup(services, cat.key) })),
    [services]
  );

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

          <div
            style={{ position: 'static', height: 76, display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setOpenMenu('services')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <Link href="/services/" className="nav-link" style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Services
              <span style={{ fontSize: 10, marginTop: 2 }}>▾</span>
            </Link>
            {openMenu === 'services' && <ServicesMegaMenu groups={serviceGroups} />}
          </div>

          <div
            style={{ position: 'static', height: 76, display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setOpenMenu('industries')}
            onMouseLeave={() => setOpenMenu(null)}
          >
            <Link href="/industries/" className="nav-link" style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 4 }}>
              Industries
              <span style={{ fontSize: 10, marginTop: 2 }}>▾</span>
            </Link>
            {openMenu === 'industries' && <FlatMenu items={industries} hrefFor={(i) => `/industries/${i.slug}/`} />}
          </div>

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

          <div>
            <button
              type="button"
              onClick={() => setMobileSection((v) => (v === 'services' ? null : 'services'))}
              style={{
                padding: '12px 8px', fontSize: 15, fontWeight: 500, color: 'var(--text)',
                borderBottom: '1px solid var(--border)', background: 'none', border: 'none',
                textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer'
              }}
            >
              Services
              <span style={{ fontSize: 11 }}>{mobileSection === 'services' ? '▴' : '▾'}</span>
            </button>
            {mobileSection === 'services' && (
              <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column' }}>
                <Link href="/services/" onClick={() => setMobileOpen(false)} style={{ padding: '10px 8px', fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
                  All Services
                </Link>

                {serviceGroups.filter((g) => g.pillars.length > 0).map((group) => {
                  const isSingle = group.pillars.length === 1;
                  return (
                    <div key={group.key}>
                      {isSingle ? (
                        <>
                          <Link href={`/services/${group.pillars[0].slug}/`} onClick={() => setMobileOpen(false)} style={{ padding: '10px 8px', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'block' }}>
                            {group.label}
                          </Link>
                          <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column' }}>
                            {group.pillars[0].children.map((child) => (
                              <Link key={child.slug} href={`/services/${child.slug}/`} onClick={() => setMobileOpen(false)} style={{ padding: '8px', fontSize: 13, color: 'var(--muted)' }}>
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <span style={{ padding: '10px 8px', fontSize: 14, fontWeight: 600, color: 'var(--text)', display: 'block' }}>{group.label}</span>
                          {group.pillars.map((pillar) => (
                            <div key={pillar.slug} style={{ paddingLeft: 16 }}>
                              <Link href={`/services/${pillar.slug}/`} onClick={() => setMobileOpen(false)} style={{ padding: '8px', fontSize: 13.5, fontWeight: 600, color: 'var(--text)', display: 'block' }}>
                                {pillar.title}
                              </Link>
                              <div style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column' }}>
                                {pillar.children.map((child) => (
                                  <Link key={child.slug} href={`/services/${child.slug}/`} onClick={() => setMobileOpen(false)} style={{ padding: '8px', fontSize: 13, color: 'var(--muted)' }}>
                                    {child.title}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              onClick={() => setMobileSection((v) => (v === 'industries' ? null : 'industries'))}
              style={{
                padding: '12px 8px', fontSize: 15, fontWeight: 500, color: 'var(--text)',
                borderBottom: '1px solid var(--border)', background: 'none', border: 'none',
                textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', cursor: 'pointer'
              }}
            >
              Industries
              <span style={{ fontSize: 11 }}>{mobileSection === 'industries' ? '▴' : '▾'}</span>
            </button>
            {mobileSection === 'industries' && (
              <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column' }}>
                <Link href="/industries/" onClick={() => setMobileOpen(false)} style={{ padding: '10px 8px', fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>
                  All Industries
                </Link>
                {industries.map((item) => (
                  <Link key={item.slug} href={`/industries/${item.slug}/`} onClick={() => setMobileOpen(false)} style={{ padding: '10px 8px', fontSize: 14, color: 'var(--text)', display: 'block' }}>
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

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
