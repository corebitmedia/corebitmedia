import Link from 'next/link';
import { getServices, getFaqs, getBlogPosts, getCaseStudies } from '../lib/api';
import FaqSection from '../components/FaqSection';
import TrustedPartners from '../components/TrustedPartners';
import Carousel from '../components/Carousel';
import HeroAnimation from '../components/HeroAnimation';

// Verbatim from the live site's own testimonial-carousel widget on the Home
// page (WordPress database export, Aug 2026). The real site reuses this
// exact same set of 4 named testimonials here and on the Services page, so
// this mirrors SERVICE_TESTIMONIALS in app/services/page.js.
const REAL_TESTIMONIALS = [
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

// Real copy + order from the live site's "Attract More Customers Expand Your
// Business...!" icon-box grid (WordPress export, post 7) — 6 items split
// into two stacked columns of 3, either side of a decorative animation,
// exactly as laid out on the live page.
const FEATURE_ITEMS = [
  { title: 'Search Engine Optimization', desc: 'We optimize your business website for leading search engines using the latest SEO tools for keyword identification and reporting.' },
  { title: 'Social Media Strategy', desc: 'Marketing campaigns across Facebook, Instagram, LinkedIn, Pinterest, YouTube, Snapchat & more.' },
  { title: 'Penalty Recovery', desc: 'No more worrying about Google penalties for bad backlinks or duplicate content — we keep your site healthy.' },
  { title: 'Online Media Management', desc: 'A one-stop solution to promote your business online and reach more customers.' },
  { title: 'Real Time and Data', desc: 'We work with current and future trends so your business is always ready for new opportunities.' },
  { title: 'Reporting & Analysis', desc: 'Real-time data to analyze performance and increase conversion rate, with regular reports.' }
];
const FEATURE_LEFT = FEATURE_ITEMS.slice(0, 3);
const FEATURE_RIGHT = FEATURE_ITEMS.slice(3, 6);

const STEPS = ['Discover & Validate', 'Design & Build', 'Launch & Promote', 'Measure & Scale'];

// Real fixed order from the live site's own service-tile slider (dm-img.jpg,
// s2.jpg, s4.jpg, s3.jpg → Digital Marketing, Dashboards, Analytics & TMS,
// CRM & Marketing) — confirmed from the WordPress export's nested-carousel
// widget, not the DB's default listing order.
const IMPACT_SERVICE_ORDER = ['digital-marketing', 'reporting-and-dashboards', 'analytics-tms', 'crm-marketing'];
const IMPACT_SERVICE_FALLBACK = [
  { slug: 'digital-marketing', title: 'Digital Marketing', shortDescription: 'End-to-end omnichannel services to promote businesses online.', iconUrl: 'https://www.corebitmedia.com/media/uploads/2025/07/dm-img.jpg' },
  { slug: 'reporting-and-dashboards', title: 'Dashboards', shortDescription: 'Interactive dashboards with real-time KPI insights.', iconUrl: 'https://www.corebitmedia.com/media/uploads/2025/06/s2.jpg' },
  { slug: 'analytics-tms', title: 'Analytics & TMS', shortDescription: 'Manage all your digital marketing apps from one location.', iconUrl: 'https://www.corebitmedia.com/media/uploads/2025/06/s4.jpg' },
  { slug: 'crm-marketing', title: 'CRM & Marketing', shortDescription: 'Expert CRM and campaigns across every major platform.', iconUrl: 'https://www.corebitmedia.com/media/uploads/2025/06/s3.jpg' }
];

// Real values + alternating card backgrounds from the live site's 4 counter
// widgets (WordPress export). The live page places these AFTER the case
// study section, not directly under the hero — matched below.
const STATS = [
  { value: '750+', label: 'Successful Projects', bg: '#F4EFF6' },
  { value: '520+', label: 'Satisfied Clients', bg: '#E8EDF0' },
  { value: '480+', label: 'Ad Accounts Managed', bg: '#F4EFF6' },
  { value: '92%', label: 'Client Retention Rate', bg: '#E8EDF0' }
];

export default async function HomePage() {
  const [services, faqs, caseStudies, blogPosts] = await Promise.all([
    getServices(),
    getFaqs('global'),
    getCaseStudies(),
    getBlogPosts()
  ]);

  const impactServices = services.length
    ? IMPACT_SERVICE_ORDER.map((slug) => services.find((s) => s.slug === slug)).filter(Boolean)
    : IMPACT_SERVICE_FALLBACK;

  return (
    <>
      <section
        className="gradient-purple"
        style={{
          color: 'white',
          padding: '64px 0',
          backgroundImage: "linear-gradient(135deg, rgba(142,38,128,0.72), rgba(35,35,88,0.8)), url('https://www.corebitmedia.com/media/uploads/2025/07/home-hero-banner.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="eyebrow" style={{ color: '#f3c9ff' }}>Strategic Digital Marketing for Scalable Growth</div>
              <h1 style={{ color: 'white' }}>Where Marketing Meets Intelligence</h1>
              <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
                <Link href="/contact-us/" className="btn" style={{ background: 'white', color: 'var(--navy)' }}>Get Free Audit</Link>
                <Link href="/services/" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>Explore More</Link>
              </div>
            </div>
            <div className="col-lg-5 mt-5 mt-lg-0">
              <HeroAnimation maxWidth={520} />
            </div>
          </div>
        </div>
      </section>

      <TrustedPartners />

      {/* "Why Choose Core Bit Media" — a text-only intro on the live site. The
          6-item feature grid used to be merged into this section in an
          earlier pass; it's actually the content of the NEXT section
          ("Attract More Customers"), confirmed from the WordPress export. */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 32px' }}>
          <h2>Why Choose <span style={{ color: 'var(--teal)' }}>Core Bit Media</span></h2>
          <p className="eyebrow" style={{ marginTop: 10 }}>Let&rsquo;s focus on the outside elements to boost your business sales.</p>
        </div>
        <div className="container row align-items-center g-5">
          <div className="col-lg-5">
            <HeroAnimation maxWidth={320} />
          </div>
          <div className="col-lg-7">
            <h2>Time-Saving and Hassle-Free <span style={{ color: 'var(--teal)' }}>Digital Marketing Services</span></h2>
            <p className="text-muted" style={{ marginTop: 16 }}>
              Core Bit Media has an experienced team of digital marketing professionals with specializations across domains.
              We work with startups, small businesses, and medium-sized organizations to gain more visibility in competitive markets.
            </p>
            <h3 style={{ marginTop: 20, fontSize: 18 }}>Let&rsquo;s pin your <span style={{ color: 'var(--teal)' }}>success story</span> next!</h3>
          </div>
        </div>
      </section>

      {/* "Attract More Customers Expand Your Business...!" — the real 6-item
          icon-box grid, split into two stacked columns of 3 around a
          decorative animation, matching the live site's own three-container
          row layout. */}
      <section className="section section-alt">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <h2><span style={{ color: 'var(--teal)' }}>Attract More Customers</span> Expand Your Business...!</h2>
          <p className="eyebrow" style={{ marginTop: 10 }}>Related Services</p>
        </div>
        <div className="container feature-split">
          <div className="feature-col">
            {FEATURE_LEFT.map((item) => (
              <div className="gradient-purple icon-box-card" key={item.title}>
                <h3 style={{ color: 'white' }}>{item.title}</h3>
                <p style={{ marginTop: 10, fontSize: 14, color: 'white', opacity: 0.9 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <HeroAnimation maxWidth={180} />
          </div>
          <div className="feature-col">
            {FEATURE_RIGHT.map((item) => (
              <div className="gradient-purple icon-box-card" key={item.title}>
                <h3 style={{ color: 'white' }}>{item.title}</h3>
                <p style={{ marginTop: 10, fontSize: 14, color: 'white', opacity: 0.9 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact-Driven Digital Marketing Services — real site renders this as
          a slider of vertical (image-on-top) cards in this fixed order. */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <h2>Impact-Driven <span style={{ color: 'var(--teal)' }}>Digital Marketing Services</span></h2>
          <p className="eyebrow" style={{ marginTop: 10 }}>Tailored Solutions for Your Digital Growth</p>
        </div>
        <div className="container">
          <Carousel>
            {impactServices.map((s, i) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}/`}
                className="service-tile-stacked"
                style={{ background: i % 2 === 0 ? '#F4EFF6' : '#E8EDF0' }}
              >
                {s.iconUrl && <img src={s.iconUrl} alt={s.title} loading="lazy" />}
                <h3 style={{ fontSize: 20 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: '#23242C' }}>{s.shortDescription}</p>
              </Link>
            ))}
          </Carousel>
        </div>
      </section>

      {/* Looking For Digital Marketing? — real site places this CTA directly
          after the services slider, not at the very bottom of the page. */}
      <section className="section gradient-purple" style={{ background: '#652A7D', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white' }}>Looking For Digital Marketing?</h2>
          <p style={{ marginTop: 12, color: '#e9d6f2' }}>Get more calls to your business, visits to your website, or customers to your store.</p>
          <Link href="/contact-us/" className="btn" style={{ marginTop: 24, display: 'inline-block', background: 'white', color: 'var(--navy)' }}>Call Us Now</Link>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <h2>Steps to Build a <span style={{ color: 'var(--teal)' }}>Successful Digital Product</span></h2>
          <p className="eyebrow" style={{ marginTop: 10 }}>How We Do It</p>
        </div>
        <div className="container grid grid-4">
          {STEPS.map((step, i) => (
            <div className="card" key={step} style={{ textAlign: 'center', background: '#FBF7FC', border: '1px solid rgba(142,38,128,0.25)' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--teal)' }}>{i + 1}</div>
              <h3 style={{ marginTop: 8 }}>{step}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Core Bit Media Case Study — real heading text. This section
          previously (wrongly) borrowed the "Attract More Customers" heading,
          which actually belongs to the feature-grid section above. */}
      {caseStudies.length > 0 && (
        <section className="section section-alt">
          <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <h2><span style={{ color: 'var(--teal)' }}>Core Bit Media</span> Case Study</h2>
            <p className="text-muted" style={{ marginTop: 8 }}>How We Make Businesses Boom</p>
          </div>
          <div className="container">
            <Carousel>
              {caseStudies.map((cs) => (
                <Link href={`/case-study/${cs.slug}/`} key={cs.slug} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  {cs.coverImageUrl && (
                    <img src={cs.coverImageUrl} alt={cs.title} loading="lazy" style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                  )}
                  <div style={{ padding: 20 }}>
                    <h3>{cs.title}</h3>
                    {cs.clientName && <p className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>{cs.clientName}</p>}
                  </div>
                </Link>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      {/* Stats — the live site places these counters right after the case
          study section, not directly under the hero as an earlier pass had
          it, and boxes them in alternating tinted cards. */}
      <section className="section" style={{ padding: '48px 0' }}>
        <div className="container grid grid-4" style={{ textAlign: 'center' }}>
          {STATS.map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '24px 12px' }}>
              <div style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 600, color: 'var(--navy)' }}>{s.value}</div>
              <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Genuine Reviews — real site pairs a big dark review-summary card
          with the testimonial slider, not a plain grid. */}
      <section className="section section-alt">
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
              {REAL_TESTIMONIALS.map((t) => (
                <div className="card" key={t.name}>
                  <img src={t.image} alt={t.name} loading="lazy" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
                  <p style={{ fontStyle: 'italic', marginTop: 16 }}>{t.quote}</p>
                  <div style={{ marginTop: 16, fontWeight: 700 }}>{t.name}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{t.title}</div>
                </div>
              ))}
            </Carousel>
          </div>
        </div>
      </section>

      <section className="section gradient-purple" style={{ background: '#652A7D', color: 'white' }}>
        <div className="container grid grid-2" style={{ gap: 40, alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'white' }}>Real Stories of Success</h2>
            <p className="eyebrow" style={{ color: '#f3c9ff', marginTop: 10 }}>Hear It Straight from Those Who&rsquo;ve Succeeded</p>
            <Link href="/contact-us/" className="btn" style={{ marginTop: 24, display: 'inline-block', background: 'white', color: 'var(--navy)' }}>Contact Us</Link>
          </div>
          {/* Real YouTube embed from the live site's own `video` widget on this
              section (WordPress export, post 7): youtube_url
              https://youtu.be/mcBCor2jdJQ, with a 10px border radius
              (_border_radius setting). */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%',
              borderRadius: 10,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)'
            }}
          >
            <iframe
              src="https://www.youtube.com/embed/mcBCor2jdJQ"
              title="What Our Clients Say About Our Marketing & Analytics"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* Latest Blogs — this section was missing from the Home page entirely
          (getBlogPosts was imported but never called), even though the live
          site has a 3-card teaser + "View All" right after Real Stories. */}
      {blogPosts.length > 0 && (
        <section className="section">
          <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <h2>Latest <span style={{ color: 'var(--teal)' }}>Blogs</span></h2>
            <p className="eyebrow" style={{ marginTop: 10 }}>Check our latest blogs</p>
          </div>
          <div className="container grid grid-3">
            {blogPosts.slice(0, 3).map((p) => (
              <Link href={`/blogs/${p.slug}/`} key={p.slug} className="card" style={{ padding: 15 }}>
                {p.coverImageUrl && (
                  <img
                    src={p.coverImageUrl}
                    alt={p.title}
                    loading="lazy"
                    style={{ width: '100%', aspectRatio: '1 / 0.55', objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
                  />
                )}
                <h3 style={{ fontSize: 18, color: '#232358' }}>{p.title}</h3>
                <span style={{ marginTop: 10, display: 'inline-block', fontSize: 15, fontWeight: 600, color: '#232358' }}>Read More &raquo;</span>
              </Link>
            ))}
          </div>
          <div className="container" style={{ textAlign: 'center', marginTop: 32 }}>
            <Link href="/blogs/" className="btn">View All</Link>
          </div>
        </section>
      )}

      <FaqSection faqs={faqs} />
    </>
  );
}
