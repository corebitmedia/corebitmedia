import Link from 'next/link';
import { getFaqs, getTestimonials } from '../../lib/api';
import FaqSection from '../../components/FaqSection';
import TrustedPartners from '../../components/TrustedPartners';
import Carousel from '../../components/Carousel';

export const metadata = {
  title: 'About Us',
  description: 'About Us — Strategic Digital Marketing for Scalable Growth. Core Bit Media — 10 years of collective experience delivering customized marketing and analytics services for measurable growth.'
};

// Verbatim from the live site's About Us page (WordPress database export, Aug 2026).
const CORE_VALUES = [
  { title: 'Transparent Pricing', desc: 'No hidden charges — you always know exactly what you’re paying for and why.' },
  { title: '24/7 Customer Support', desc: 'Our team is available around the clock to answer questions and keep campaigns on track.' },
  { title: 'A Realistic Approach', desc: 'We stay current with industry trends so strategy is grounded in what actually works today.' },
  { title: 'Long-Term Relationships', desc: 'We’ve built lasting client relationships since day one, prioritizing trust over quick wins.' }
];

export default async function AboutPage() {
  const [faqs, testimonials] = await Promise.all([getFaqs('global'), getTestimonials()]);

  return (
    <>
      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <div className="eyebrow">Strategic Digital Marketing for Scalable Growth</div>
          <h1>About Us</h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <div className="eyebrow">About Core Bit Media</div>
          <p className="text-muted" style={{ marginTop: 12, fontSize: 17 }}>
            Core Bit Media is an online marketing company that specializes in helping businesses to improve their
            visibility and reach online. We offer a variety of services, including Digital Marketing like (SEO, SMM,
            PPC, Content Marketing, Social Media Marketing), Automation Marketing, Email Marketing, Google Analytics,
            Google Tag Manager, Adobe Analytics, A/B Testing, Custom Report creations and many more. Our team of
            experienced professionals is passionate about helping businesses to succeed online. We understand the
            importance of a strong online presence, and we work with our clients to develop and implement customized
            marketing strategies that will help them to achieve their goals.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 860 }}>
          <h2>Boosts Your Website Traffic!</h2>
          <p className="text-muted" style={{ marginTop: 16, fontSize: 17 }}>
            Core Bit Media is a complete digital marketing service provider with 10 years of collective experience in
            the industry. Our experts have worked with numerous startups, small and medium businesses, and nonprofit
            organizations to provide a range of customized services. Our passionate team is a combination of
            expertise and creativity. Our team believes in communication, collaboration, and trust. We offer
            transparent pricing so that you know there won&rsquo;t be any hidden charges or surprises in the final
            bill. Many of our clients have been with us since our inception. We work as a unit and maintain healthy
            relationships. Your satisfaction is important to us. At Core Bit Media, we deliver the promised results
            and more. We stay realistic in our approach and stay up to date with the latest developments in the
            industry. Talk to our team to get a free consultation.
          </p>
        </div>
      </section>

      <section style={{ padding: '28px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container grid grid-4" style={{ textAlign: 'center' }}>
          <div><div style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 600, color: 'var(--navy)' }}>750+</div><div className="text-muted" style={{ fontSize: 13 }}>Successful Projects</div></div>
          <div><div style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 600, color: 'var(--navy)' }}>520+</div><div className="text-muted" style={{ fontSize: 13 }}>Satisfied Clients</div></div>
          <div><div style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 600, color: 'var(--navy)' }}>480+</div><div className="text-muted" style={{ fontSize: 13 }}>Ad Accounts Managed</div></div>
          <div><div style={{ fontSize: 'clamp(32px, 5vw, 50px)', fontWeight: 600, color: 'var(--navy)' }}>92%</div><div className="text-muted" style={{ fontSize: 13 }}>Client Retention Rate</div></div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
          <div className="eyebrow">Why Choose us</div>
          <h2>Save Time &amp; Effort With the Core Bit Media</h2>
        </div>
        <div className="container grid grid-4">
          {CORE_VALUES.map((v) => (
            <div className="card" key={v.title}>
              <h3>{v.title}</h3>
              <p className="text-muted" style={{ marginTop: 10, fontSize: 14 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <TrustedPartners />

      {testimonials.length > 0 && (
        <section className="section section-alt">
          <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
            <div className="eyebrow">Our Clients are Happy!</div>
            <h2>Genuine Reviews from our Partners</h2>
            <p className="text-muted" style={{ marginTop: 12 }}>4.9 — 80 Reviews</p>
          </div>
          <div className="container">
            <Carousel>
              {testimonials.map((t) => (
                <div className="card" key={t.id}>
                  <p style={{ fontStyle: 'italic' }}>{t.quote}</p>
                  <div style={{ marginTop: 16, fontWeight: 700 }}>{t.clientName}</div>
                  <div className="text-muted" style={{ fontSize: 13 }}>{t.clientRole}</div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>
      )}

      <FaqSection faqs={faqs} />

      <section className="section gradient-purple" style={{ color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: 'white' }}>Looking For Digital Marketing?</h2>
          <p style={{ marginTop: 12, color: '#e9d6f2' }}>Get more calls to your business, visits to your website, or customers to your store.</p>
          <Link href="/contact-us/" className="btn" style={{ marginTop: 24, display: 'inline-block', background: 'white', color: 'var(--navy)' }}>Call Us Now</Link>
        </div>
      </section>
    </>
  );
}
