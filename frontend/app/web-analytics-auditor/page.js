import Link from 'next/link';
import StructuredData from '../../components/StructuredData';
import { ExtensionLeadProvider, GetExtensionButton } from '../../components/ExtensionLeadModal';
import './auditor.css';

export const metadata = {
  title: 'Web Analytics Auditor: Chrome Extension for Tracking Audits',
  description: 'Check GA4, Google Tag Manager, Meta, TikTok, LinkedIn and 40+ other tags on any page. See the real hits they send, catch double-firing and missing consent, and get a fix for every issue.',
  alternates: { canonical: '/web-analytics-auditor/' },
  openGraph: {
    title: 'Web Analytics Auditor: is your tracking actually working?',
    description: 'A Chrome extension from Core Bit Media that audits analytics and ad pixels on any page and tells you how to fix what is broken.',
    url: '/web-analytics-auditor/'
  }
};

const schema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Web Analytics Auditor',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Chrome',
  description: 'Chrome extension that audits analytics and advertising tags on any web page.',
  url: 'https://www.corebitmedia.com/web-analytics-auditor/',
  publisher: { '@type': 'Organization', name: 'Core Bit Media', url: 'https://www.corebitmedia.com' }
};

const FEATURES = [
  { icon: '◎', color: '#2a6fb5', title: 'See every tag and ID', text: 'Finds 40+ analytics, advertising, heatmap, consent and CRM tools, and lists the measurement, pixel and container IDs they use. Click an ID to copy it.' },
  { icon: '⚡', color: '#d9b800', title: 'Watch hits live', text: 'Captures the real requests a page sends, with event names such as page_view and purchase. Click through a checkout and see every event arrive.' },
  { icon: '⧉', color: '#e0267f', title: 'Catch double counting', text: 'Flags the same ID installed on the page and in Tag Manager, multiple GTM containers, and page views that fire twice within seconds.' },
  { icon: '✓', color: '#1a9b4b', title: 'Check consent setup', text: 'Detects the cookie banner platform, Google Consent Mode v2 signals, and whether your tags run before a visitor has agreed to anything.' },
  { icon: '★', color: '#7b2a8c', title: 'Get a score and a fix list', text: 'Every page gets a 0 to 100 score and an A to F grade. Each problem comes with a plain-language fix you can hand to a developer.' },
  { icon: '⇪', color: '#d62f2f', title: 'Share the proof', text: 'Export a report as JSON or CSV, or copy a summary into Slack or email, so everyone sees the same findings.' }
];

const STEPS = [
  { title: 'Get the extension', text: 'Fill in the short form and the download starts. Loading it into Chrome takes about a minute.' },
  { title: 'Open any site', text: 'Visit the page you want to check, such as a landing page, a checkout or a thank-you page.' },
  { title: 'Click, then Reload & audit', text: 'The popup lists every tag, event and issue. Fix what it flags, reload, and check again.' }
];

const CHECKS = [
  ['critical', 'Critical', <>Only Universal Analytics installed (stopped collecting data in 2023)</>],
  ['critical', 'Critical', <>Placeholder IDs such as <code>G-XXXXXXXXXX</code> left in the page</>],
  ['warning', 'Warning', <>Same GA4 or pixel ID on the page and inside Tag Manager</>],
  ['warning', 'Warning', <>Page view firing twice, or a tag loaded but never firing</>],
  ['warning', 'Warning', <>No consent platform, or Consent Mode v2 signals missing</>],
  ['info', 'Note', <>No custom <code>dataLayer</code> events, or only base events seen</>],
  ['pass', 'Passed', <>GA4 firing, consent platform present, Consent Mode v2 set</>]
];

const TOOLS = [
  'Google Analytics 4', 'Google Tag Manager', 'Google Ads', 'Meta Pixel', 'TikTok Pixel', 'LinkedIn Insight',
  'X (Twitter) Pixel', 'Pinterest Tag', 'Snapchat Pixel', 'Reddit Pixel', 'Microsoft Ads (UET)', 'Adobe Analytics',
  'Matomo', 'Mixpanel', 'Amplitude', 'Segment', 'PostHog', 'Hotjar', 'Microsoft Clarity', 'FullStory',
  'OneTrust', 'Cookiebot', 'Usercentrics', 'CookieYes', 'HubSpot', 'Klaviyo', 'Intercom'
];

const FAQS = [
  ['How is this different from looking at the page source?', 'Source only shows what the HTML contains. Many tags are injected by JavaScript or Tag Manager after the page loads, and the only proof they work is the request they send. The extension watches those requests and the page\'s runtime state, so it sees what actually happens.'],
  ['Why does it say a tag is "installed" but not "firing"?', 'The library is on the page but no tracking request was seen. Common causes are consent banners that hold tags back until a visitor agrees, an ad blocker, or a broken setup. Accept cookies and audit again to compare.'],
  ['Does it work on checkout and thank-you pages?', 'Yes. The popup updates live as you move through the journey, so you can add to cart, submit a form or complete a test order and watch the events arrive.'],
  ['Does it work in other browsers?', 'It is built for Chrome. Other Chromium browsers may load it, but they are not officially supported yet.'],
  ['Is it a replacement for a full tracking audit?', 'It finds the problems that are visible in the browser, which covers most day-to-day issues. Server-side tagging, platform-side settings and data quality inside your reports still need a person to review them. That is what our team does.']
];

function SampleReport() {
  return (
    <figure className="waa-mock" aria-label="Sample audit result">
      <div className="waa-mock-bar">
        <span className="waa-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>Web Analytics Auditor</span>
      </div>
      <div className="waa-mock-body">
        <div className="waa-rep-head">
          <svg viewBox="0 0 80 80" className="waa-ring" role="img" aria-label="Score 66 out of 100, grade C">
            <circle cx="40" cy="40" r="34" className="waa-ring-track" />
            <circle cx="40" cy="40" r="34" className="waa-ring-fill" strokeDasharray="213.6" strokeDashoffset="72.6" transform="rotate(-90 40 40)" />
            <text x="40" y="44" className="waa-ring-score" textAnchor="middle">66</text>
            <text x="40" y="58" className="waa-ring-grade" textAnchor="middle">Grade C</text>
          </svg>
          <div>
            <div className="waa-host">shop.example.com</div>
            <div className="waa-sub">Checkout | Demo Shop</div>
            <div className="waa-chips">
              <span className="waa-chip waa-chip-crit">0 critical</span>
              <span className="waa-chip waa-chip-warn">2 warnings</span>
              <span className="waa-chip waa-chip-pass">3 passed</span>
            </div>
          </div>
        </div>

        <div className="waa-tool">
          <div><strong>Google Analytics 4</strong> <span className="waa-badge waa-badge-ok">Firing</span></div>
          <div className="waa-tags"><span className="waa-id">G-ABCDE12345</span></div>
          <div className="waa-tags"><span className="waa-ev">page_view</span><span className="waa-ev">begin_checkout</span></div>
        </div>
        <div className="waa-tool">
          <div><strong>Meta (Facebook) Pixel</strong> <span className="waa-badge waa-badge-ok">Firing</span> <span className="waa-badge waa-badge-warn">duplicate page view</span></div>
          <div className="waa-tags"><span className="waa-id">123456789012345</span></div>
          <div className="waa-tags"><span className="waa-ev">PageView ×2</span></div>
        </div>
        <div className="waa-finding">
          <span className="waa-sev">Warning</span> <strong>Meta Pixel fires the page view more than once</strong>
          <p><b>Fix: </b>Look for the tag installed twice: hard-coded in the theme and inside GTM.</p>
        </div>
        <figcaption>Sample data for illustration</figcaption>
      </div>
    </figure>
  );
}

export default function WebAnalyticsAuditorPage() {
  return (
    <ExtensionLeadProvider>
      <StructuredData data={schema} />

      {/* Hero */}
      <section className="gradient-purple waa-hero">
        <div className="container waa-hero-grid">
          <div>
            <div className="eyebrow" style={{ color: '#f3c9ff' }}>Chrome Extension</div>
            <h1 style={{ color: 'white' }}>Know if your tracking is actually working.</h1>
            <p className="waa-lede">
              Web Analytics Auditor checks GA4, Google Tag Manager, Meta, TikTok, LinkedIn and 40+ other tools on any
              page. It shows the hits they really send, flags what is broken, and tells you how to fix it.
            </p>
            <div className="waa-cta-row">
              <GetExtensionButton location="hero">Get the extension</GetExtensionButton>
              <a href="#features" className="btn btn-lg waa-btn-light">See what it finds</a>
            </div>
            <ul className="waa-ticks">
              <li>Reads real network traffic, not just page source</li>
              <li>Runs entirely in your browser</li>
              <li>One-click export for clients and teammates</li>
            </ul>
          </div>
          <SampleReport />
        </div>
      </section>

      {/* Problem strip */}
      <section className="waa-strip">
        <div className="container">
          <p><strong>Broken tracking rarely announces itself.</strong> A tag installed twice, a pixel that never fires,
            a container nobody published: your reports still load, they are just wrong. This extension shows you what
            the browser is really sending.</p>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="container">
          <div className="eyebrow">Features</div>
          <h2>Everything you need to trust your data</h2>
          <p className="text-muted waa-section-lede">Open any page, click the icon, and get an answer in seconds.</p>
          <div className="grid grid-3" style={{ marginTop: 36 }}>
            {FEATURES.map((f) => (
              <div className="card hoverable" key={f.title}>
                <div className="waa-ico" style={{ background: f.color }} aria-hidden="true">{f.icon}</div>
                <h3 style={{ margin: '16px 0 8px' }}>{f.title}</h3>
                <p className="text-muted">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-alt" id="how">
        <div className="container">
          <div className="eyebrow">How it works</div>
          <h2>Three steps to an audit</h2>
          <ol className="waa-how">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="waa-num">{i + 1}</span>
                <div><h3>{s.title}</h3><p className="text-muted">{s.text}</p></div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What it flags + tools */}
      <section className="section" id="checks">
        <div className="container grid grid-2" style={{ gap: 48, alignItems: 'start' }}>
          <div>
            <div className="eyebrow">What it checks</div>
            <h2>What it flags</h2>
            <p className="text-muted waa-section-lede">Each finding is ranked critical, warning, note or passed, so you know where to start.</p>
            <ul className="waa-checks">
              {CHECKS.map(([kind, label, text], i) => (
                <li key={i}><span className={`waa-sev waa-sev-${kind}`}>{label}</span><span>{text}</span></li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Tools it recognises</h3>
            <div className="waa-pills">
              {TOOLS.map((t) => <span key={t}>{t}</span>)}
              <span className="waa-more">+ more</span>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="eyebrow">Privacy</div>
          <h2>Private by design</h2>
          <p className="text-muted waa-section-lede">
            The audit runs inside your browser. Nothing you scan is sent to Core Bit Media or anyone else. Data for each
            tab is kept in your browser's session storage and cleared when you close the tab.
          </p>
          <p className="text-muted" style={{ marginTop: 14, fontSize: 14 }}>
            The extension asks for access to all sites so it can watch tracking requests on whichever page you open. To
            identify tools it reads request addresses, the page's script tags, cookie names and the <code>dataLayer</code>,
            all locally. It does not read what you type into forms or the text of the page, and it does not change the
            pages you visit.
          </p>
        </div>
      </section>

      {/* Install */}
      <section className="section" id="install">
        <div className="container grid grid-2" style={{ gap: 48, alignItems: 'start' }}>
          <div>
            <div className="eyebrow">Get started</div>
            <h2>Get the extension</h2>
            <p className="text-muted waa-section-lede">
              Tell us where to reach you and the download starts straight away. It is distributed directly for now, so
              you install it once in Chrome's developer mode.
            </p>
            <div style={{ marginTop: 24 }}>
              <GetExtensionButton location="install">Get the extension</GetExtensionButton>
            </div>
            <p className="text-muted" style={{ marginTop: 14, fontSize: 14 }}>Requires Chrome 111 or newer. Version 0.1.0.</p>
          </div>
          <ol className="waa-install">
            <li>Unzip the download to a folder you will keep.</li>
            <li>In Chrome, open <code>chrome://extensions</code> and turn on <strong>Developer mode</strong> (top right).</li>
            <li>Click <strong>Load unpacked</strong> and select the unzipped folder, the one that contains <code>manifest.json</code>.</li>
            <li>Pin the extension from the puzzle-piece menu, open any website, click the icon and press <strong>Reload &amp; audit</strong>.</li>
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt" id="faq">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="eyebrow">FAQ</div>
          <h2>Questions</h2>
          <div style={{ marginTop: 24 }}>
            {FAQS.map(([q, a]) => (
              <details className="waa-faq" key={q}>
                <summary>{q}</summary>
                <p className="text-muted">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="section gradient-purple" style={{ color: 'white' }}>
        <div className="container waa-band">
          <div>
            <h2 style={{ color: 'white' }}>Want a hand fixing what it finds?</h2>
            <p style={{ marginTop: 8, maxWidth: 560, opacity: 0.9 }}>
              Core Bit Media sets up and repairs GA4, Tag Manager, pixels and conversion tracking so your reports can be trusted.
            </p>
          </div>
          <div className="waa-cta-row">
            <Link href="/contact-us/" className="btn btn-lg waa-btn-light">Talk to Core Bit Media</Link>
            <GetExtensionButton className="btn btn-lg" location="footer-band">Get the extension</GetExtensionButton>
          </div>
        </div>
        <p className="container waa-legal">
          Google, Meta, TikTok, LinkedIn and other names are trademarks of their owners and are used only to describe the
          tools this extension can detect. Not affiliated with or endorsed by them.
        </p>
      </section>
    </ExtensionLeadProvider>
  );
}
