import Link from 'next/link';
import { getServices, getFaqs } from '../../lib/api';
import HeroAnimation from '../../components/HeroAnimation';
import Carousel from '../../components/Carousel';
import FaqSection from '../../components/FaqSection';

// Verbatim from the live site's own testimonial-carousel widget on this page
// (WordPress database export, Aug 2026) — real named clients, real photos,
// distinct from the generic Testimonial model data used on Home/About.
const SERVICE_TESTIMONIALS = [
  {
    name: 'Bindu',
    title: 'Marketing Agency',
    image: 'https://www.corebitmedia.com/media/uploads/2025/06/testimonial-1.jpg',
    quote: "Since partnering with Core Bit Media, our website's visibility and organic traffic have experienced a remarkable boost. Their comprehensive strategies and commitment to staying ahead in SEO trends have truly set them apart. Thank you, Core Bit Media, for significantly enhancing our online presence."
  },
  {
    name: 'Sarah',
    title: 'Marketing manager',
    image: 'https://www.corebitmedia.com/media/uploads/2025/06/testimonial-2.jpg',
    quote: 'Core Bit Media Agency delivered outstanding results in GA4 implementation, GTM setup, reporting, and SEO optimization. Their expertise in Google Analytics 4 and Tag Manager streamlined our tracking processes. The comprehensive reports provided valuable insights, and their SEO strategies significantly boosted our online visibility.'
  },
  {
    name: 'Hayley',
    title: 'Marketing Head',
    image: 'https://www.corebitmedia.com/media/uploads/2025/06/testimonial-3.jpg',
    quote: 'Core Bit Media has truly elevated our online presence through their stellar management of our Google Ads campaigns. Their strategic approach and attention to detail have resulted in a significant increase in both clicks and conversions.'
  },
  {
    name: 'Martin',
    title: 'Marketing Operations',
    image: 'https://www.corebitmedia.com/media/uploads/2025/06/testimonial-4.jpg',
    quote: 'Hats off to Core Bit Media Agency for their outstanding work on custom tracking in Google Analytics 4, Google Ads and Facebook Ads using GTM. The meticulous implementation of custom tracking solutions has provided us with unparalleled insights, empowering our marketing strategies.'
  }
];

export const metadata = {
  title: 'Services',
  description: 'Explore Core Bit Media\'s digital marketing, reporting, analytics, and CRM services built for scalable growth.',
  alternates: { canonical: '/services/' }
};

// Verbatim from the live site's pricing table (WordPress database export, Aug 2026).
const PLANS = [
  {
    name: 'Basic Plan',
    subheading: 'Best for small businesses starting their growth journey',
    price: 199,
    features: [
      'Complete Website Auditing',
      'Error Fix of the Website for Needs',
      'Keyword Research & Analysis',
      'GA4 + GTM setup & basic event tracking',
      'Complete One-Page Optimization',
      '24/7 Our online support'
    ]
  },
  {
    name: 'Advance Plan',
    subheading: 'Best for growing businesses focused on performance',
    price: 299,
    featured: true,
    features: [
      'Complete Website Auditing',
      'Error Fix of the Website for Needs',
      'Keyword Research & Power Link Building',
      'GA4 + GTM setup (forms & conversions)',
      'Complete One-Page Optimization',
      '24/7 Our online support'
    ]
  },
  {
    name: 'Premium Plan',
    subheading: 'Best for scale-ups & data-driven businesses',
    price: 499,
    features: [
      'Complete Website Auditing',
      'Error Fix of the Website for Needs',
      'Keyword Research & Power Link Building',
      'Advanced GA4 + GTM, funnel & attribution tracking',
      'Complete One-Page Optimization',
      '24/7 Our online support'
    ]
  }
];

// Real target values from the live site's own 4 counter widgets (confirmed
// via each widget's data-to-value attribute, WordPress/Elementor export Aug
// 2026) — "Proven Results" section, placed after Our Mission / Our Vision.
const STATS = [
  { value: 574, title: 'Successful Projects', sub: 'Media Gallery Images', bg: '#F4EFF6' },
  { value: 1287, title: 'Happy Quantum Users', sub: "In Two Month's", bg: '#E8EDF0' },
  { value: 958, title: 'Cups of Bracing Coffee', sub: 'To Stay Active', bg: '#F4EFF6' },
  { value: 4251, title: 'Lines of Perfect Code', sub: 'Peaceful Code', bg: '#E8EDF0' }
];

export default async function ServicesPage() {
  const [services, faqs] = await Promise.all([getServices(), getFaqs('global')]);
  const topLevel = services.filter((s) => !s.parentId);

  return (
    <>
      <section
        className="gradient-purple"
        style={{
          color: 'white',
          padding: '56px 0',
          backgroundImage: "linear-gradient(135deg, rgba(142,38,128,0.88), rgba(35,35,88,0.92)), url('https://www.corebitmedia.com/media/uploads/2025/07/services-banner.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="eyebrow" style={{ color: '#f3c9ff' }}>Strategic Digital Marketing for Scalable Growth</div>
              <h1 style={{ color: 'white' }}>Boost Brand with Professional SEO and Marketing</h1>
              <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/contact-us/" className="btn" style={{ background: 'white', color: 'var(--navy)' }}>Get Free Audit</Link>
                <Link href="#pricing" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Explore More</Link>
              </div>
            </div>
            <div className="col-lg-5 mt-5 mt-lg-0">
              <HeroAnimation maxWidth={340} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5">
              <img
                src="https://www.corebitmedia.com/media/uploads/2025/06/inner-hero2-img.png"
                alt="Marketing analytics dashboard"
                style={{ width: '100%', maxWidth: 380, margin: '0 auto', display: 'block' }}
              />
            </div>
            <div className="col-lg-7">
              <div className="eyebrow">Proven Results</div>
              <h2>Monitor Business Indices, Visitor Traffic etc. through Latest Analytic Tools</h2>
              <p className="text-muted" style={{ marginTop: 16 }}>
                Core Bit Media has an experienced team of digital marketing professionals with specializations in
                different domains. We work with startups, small businesses, and medium-sized organizations to gain
                more visibility in the competitive markets. We offer reliable services and guarantee client
                satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div className="eyebrow">Tailored Solutions for Your Digital Growth</div>
          <h2>Impact-Driven Services</h2>
        </div>
        <div className="container">
          {/* Live site renders this as a real Elementor slider (nested-carousel,
              4 slides visible with arrows + pagination), each slide a
              vertical image-on-top card, matching the same section on Home. */}
          <Carousel>
            {topLevel.map((s, i) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}/`}
                className="service-tile-stacked"
                style={{ background: i % 2 === 0 ? '#F4EFF6' : '#E8EDF0' }}
              >
                {s.iconUrl && <img src={s.iconUrl} alt={s.title} />}
                <h3 style={{ fontSize: 20 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#23242C' }}>{s.shortDescription}</p>
                <span style={{ marginTop: 'auto', paddingTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>Read More &raquo;</span>
              </Link>
            ))}
          </Carousel>
        </div>
      </section>

      <section className="section gradient-purple" style={{ color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white' }}>Looking For Digital Marketing?</h2>
          <p style={{ marginTop: 12, color: '#e9d6f2' }}>Get more calls to your business, visits to your website, or customers to your store.</p>
          <Link href="/contact-us/" className="btn" style={{ marginTop: 24, display: 'inline-block', background: 'white', color: 'var(--navy)' }}>Call Us Now</Link>
        </div>
      </section>

      <section className="section">
        <div className="container row align-items-center g-5">
          <div className="col-lg-7">
            <h2>Proven Results, And <span style={{ color: 'var(--teal)' }}>Exceptional Your Services</span></h2>
            <p className="text-muted" style={{ marginTop: 16 }}>
              Welcome to Core Bit Media your trusted partner for comprehensive SEO and digital marketing solutions with our proven expertise.
            </p>
            <div className="row g-4" style={{ marginTop: 8 }}>
              <div className="col-sm-6">
                <div style={{ background: '#F4EFF6', borderRadius: 10, padding: 20, boxShadow: 'inset 0 0 5px 2px rgba(142,38,128,0.5)' }}>
                  <h3 style={{ fontSize: 18 }}>Our Mission</h3>
                  <p style={{ marginTop: 8, fontSize: 16, color: '#23242C' }}>We strive to be more than just a service provider, we aim to be trusted CoreBitMedia</p>
                </div>
              </div>
              <div className="col-sm-6">
                <div style={{ background: '#F4EFF6', borderRadius: 10, padding: 20, boxShadow: 'inset 0 0 5px 2px rgba(142,38,128,0.5)' }}>
                  <h3 style={{ fontSize: 18 }}>Our Vision</h3>
                  <p style={{ marginTop: 8, fontSize: 16, color: '#23242C' }}>We aspire to create a world where every business owner feels empowered</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5">
            <div style={{ background: '#F4EFF6', borderRadius: 10, padding: 20 }}>
              <img
                src="https://www.corebitmedia.com/media/uploads/2025/06/digital-solutions-img.png"
                alt="Digital solutions"
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          </div>
        </div>
        <div className="container grid grid-4" style={{ marginTop: 48, textAlign: 'center' }}>
          {STATS.map((s) => (
            <div key={s.title} style={{ background: s.bg, borderRadius: 10, padding: '24px 12px' }}>
              <div style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, color: 'var(--navy)' }}>{s.value}+</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{s.title}</div>
              <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-alt" id="pricing">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div className="eyebrow">Pricing</div>
          <h2>Choice Best &amp; Reliable Pricing Plan</h2>
        </div>
        <div className="container grid grid-3" style={{ alignItems: 'stretch' }}>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                border: plan.featured ? '2px solid var(--teal)' : undefined,
                position: 'relative'
              }}
            >
              {plan.featured && (
                <div
                  style={{
                    position: 'absolute', top: -12, left: 24,
                    background: 'var(--gold)', color: 'var(--navy)',
                    fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 999
                  }}
                >
                  Popular
                </div>
              )}
              <h3>{plan.name}</h3>
              <p className="text-muted" style={{ marginTop: 8, fontSize: 14, minHeight: 42 }}>{plan.subheading}</p>
              <div
                style={{
                  marginTop: 16, padding: '16px 20px', borderRadius: 10,
                  background: 'linear-gradient(135deg, var(--teal), var(--navy))',
                  color: 'white', textAlign: 'center'
                }}
              >
                <span style={{ fontSize: 34, fontWeight: 700 }}>${plan.price}</span>
                <span style={{ fontSize: 14, opacity: 0.85 }}> / Monthly</span>
              </div>
              <ul style={{ marginTop: 20, paddingLeft: 0, listStyle: 'none', flexGrow: 1 }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      padding: '10px 0', borderBottom: '1px solid var(--border)',
                      fontSize: 14, color: 'var(--text)'
                    }}
                  >
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact-us/"
                className="btn"
                style={{ marginTop: 24, textAlign: 'center' }}
              >
                Get This Plan
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <h2>Genuine Reviews from our <span style={{ color: 'var(--teal)' }}>Partners</span></h2>
          <p className="eyebrow" style={{ marginTop: 10 }}>Our Clients are Happy!</p>
        </div>
        <div className="container row g-4 align-items-stretch">
          <div className="col-lg-3">
            <div style={{ background: 'var(--navy)', color: 'white', borderRadius: 12, padding: 28, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 700 }}>4.9</div>
              <div style={{ color: 'var(--gold)', letterSpacing: 2, marginTop: 6 }}>★★★★★</div>
              <div style={{ marginTop: 8, opacity: 0.85, fontSize: 14 }}>80 Reviews</div>
              <div style={{ marginTop: 16, fontWeight: 600 }}>Customer experiences that speak for themselves</div>
            </div>
          </div>
          <div className="col-lg-9">
            <Carousel>
              {SERVICE_TESTIMONIALS.map((t) => (
                <div className="card" key={t.name}>
                  <img src={t.image} alt={t.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                  <p style={{ fontStyle: 'italic', marginTop: 16 }}>{t.quote}</p>
                  <div style={{ marginTop: 16, fontWeight: 700 }}>{t.name}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{t.title}</div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      <FaqSection faqs={faqs} />
    </>
  );
}
