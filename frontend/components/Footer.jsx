import Link from 'next/link';

// Real values confirmed via direct query of the live WordPress footer's own
// Elementor data (post-224): a social-icons widget (Facebook, Instagram,
// LinkedIn — circle shape, #232358 icon color) sitting inside a light
// rounded card, plus a Contact Us icon-list with real tel:/mailto: links.
const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/OfficialCoreBitMedia',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/></svg>
    )
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/corebitmedia/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07M12 0C8.74 0 8.33.01 7.05.07c-1.28.06-2.15.26-2.91.56a5.9 5.9 0 0 0-2.13 1.39A5.9 5.9 0 0 0 .62 4.14c-.3.76-.5 1.63-.56 2.91C0 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.28.26 2.15.56 2.91.3.79.71 1.46 1.38 2.13.66.66 1.34 1.07 2.13 1.38.76.3 1.63.5 2.91.56C8.33 24 8.74 24 12 24s3.67-.01 4.95-.07c1.28-.06 2.15-.26 2.91-.56a5.9 5.9 0 0 0 2.13-1.38 5.9 5.9 0 0 0 1.38-2.13c.3-.76.5-1.63.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.28-.26-2.15-.56-2.91a5.9 5.9 0 0 0-1.38-2.13A5.9 5.9 0 0 0 19.86.63c-.76-.3-1.63-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84Zm0 10.16A4 4 0 1 1 16 12a4 4 0 0 1-4 4Zm6.41-10.4a1.44 1.44 0 1 1-1.44-1.44 1.44 1.44 0 0 1 1.44 1.44Z"/></svg>
    )
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/corebitmedia',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45C23.2 24 24 23.22 24 22.25V1.75C24 .78 23.2 0 22.22 0Z"/></svg>
    )
  }
];

const ICONS = {
  pin: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ flexShrink: 0, marginTop: 3 }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.66 2.62a2 2 0 0 1-.45 2.11L8.09 9.68a16 16 0 0 0 6 6l1.23-1.23a2 2 0 0 1 2.11-.45c.84.32 1.72.54 2.62.66A2 2 0 0 1 22 16.92Z" />
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ flexShrink: 0, marginTop: 3 }}>
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 6 10 7 10-7" />
    </svg>
  ),
  clock: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ flexShrink: 0, marginTop: 3 }}>
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  )
};

export default function Footer() {
  return (
    <footer
      style={{
        backgroundImage: 'radial-gradient(at center center, #652a7d 0%, var(--navy) 100%)',
        color: 'white',
        paddingTop: 40
      }}
    >
      <div className="container grid grid-4" style={{ paddingBottom: 40, alignItems: 'start' }}>
        <div
          style={{
            background: '#F4EFF6',
            color: '#23242C',
            borderRadius: 10,
            padding: 20,
            boxShadow: 'inset 0 0 5px 5px rgba(142,38,128,0.5)'
          }}
        >
          <img
            src="https://www.corebitmedia.com/wp-content/uploads/2025/07/logo-corebitmedia1-2.png"
            alt="Core Bit Media"
            style={{ height: 36, width: 'auto', borderRadius: 10 }}
          />
          <p style={{ marginTop: 16, fontSize: 14, fontFamily: "'Poppins', sans-serif", color: '#23242C' }}>
            Core Bit Media supports businesses of all types across industries. With 10+ years of expertise, we
            deliver customized marketing and analytics services designed to drive measurable growth and long-term success.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                style={{
                  width: 34, height: 34, borderRadius: '50%', background: 'white', color: '#232358',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: 16, fontSize: 20, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, fontFamily: "'Poppins', sans-serif" }}>
            <li><Link href="/about-us/">About Us</Link></li>
            <li><Link href="/blogs/">Blogs</Link></li>
            <li><Link href="/case-study/">Case Study</Link></li>
            <li><Link href="/contact-us/">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: 16, fontSize: 20, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Main Services</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 16, fontFamily: "'Poppins', sans-serif" }}>
            <li><Link href="/services/">Services</Link></li>
            <li><Link href="/services/digital-marketing/">Digital Marketing</Link></li>
            <li><Link href="/services/reporting-and-dashboards/">Reporting &amp; Dashboards</Link></li>
            <li><Link href="/services/analytics-tms/">Analytics &amp; TMS</Link></li>
            <li><Link href="/services/crm-marketing/">CRM &amp; Marketing</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'white', marginBottom: 16, fontSize: 20, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14, fontSize: 16, fontFamily: "'Poppins', sans-serif", padding: 0 }}>
            <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {ICONS.pin}
              <span>Bestech Business Tower, Sector 66, Sahibzada Ajit Singh Nagar, Punjab 160055</span>
            </li>
            <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {ICONS.phone}
              <a href="tel:+918968661985" style={{ color: 'white' }}>+91-89686-61985</a>
            </li>
            <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {ICONS.mail}
              <a href="mailto:sales@corebitmedia.com" style={{ color: 'white' }}>sales@corebitmedia.com</a>
            </li>
            <li style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              {ICONS.clock}
              <span>Monday - Friday, 9:00 AM - 5:00 PM</span>
            </li>
          </ul>
        </div>
      </div>
      <div style={{ borderTop: '1px solid #f0f0f0', padding: '20px 0', fontSize: 14, fontFamily: "'Poppins', sans-serif", textAlign: 'center' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <span>© {new Date().getFullYear()} Core Bit Media. All Rights Reserved</span>
          <span style={{ display: 'flex', gap: 16 }}>
            <Link href="/privacy-policy/">Privacy Policy</Link>
            <Link href="/terms-of-service/">Terms of Service</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
