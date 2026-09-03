import ContactForm from '../../components/ContactForm';
import TrustedPartners from '../../components/TrustedPartners';
import HeroAnimation from '../../components/HeroAnimation';

export const metadata = {
  title: 'Contact Us',
  description: 'Contact Us — Claim your Free Audit, Supercharge Your Campaigns! Get in touch with Core Bit Media for a free digital marketing audit.',
  alternates: { canonical: '/contact-us/' }
};

export default function ContactPage() {
  return (
    <>
      <section
        className="gradient-purple"
        style={{
          color: 'white',
          padding: '56px 0',
          backgroundImage: "linear-gradient(135deg, rgba(142,38,128,0.88), rgba(35,35,88,0.92)), url('https://media.corebitmedia.com/wp-content/uploads/2025/07/contact-banner.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <div className="eyebrow" style={{ color: '#f3c9ff' }}>Strategic Digital Marketing for Scalable Growth</div>
              <h1 style={{ color: 'white' }}>Contact Us</h1>
            </div>
            <div className="col-lg-5 mt-5 mt-lg-0">
              <HeroAnimation maxWidth={320} />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          <div>
            <div className="eyebrow">Get In Touch</div>
            <h2>Claim Your Free Audit — Supercharge Your Campaigns!</h2>
            <p className="text-muted" style={{ marginTop: 16 }}>
              Welcome to Core Bit Media, where digital innovation meets marketing excellence! We're thrilled to
              connect with you and explore how we can elevate your brand to new heights — whether you have questions,
              need support, or are ready to launch a digital transformation initiative.
            </p>
            <div style={{ marginTop: 32 }}>
              <p><strong>Address</strong></p>
              <p className="text-muted">Bestech Business Tower, Sector 66, Sahibzada Ajit Singh Nagar, Punjab 160055</p>
              <p style={{ marginTop: 16 }}><strong>Phone</strong></p>
              <p className="text-muted">+91-89686-61985</p>
              <p style={{ marginTop: 16 }}><strong>Email</strong></p>
              <p className="text-muted">sales@corebitmedia.com</p>
              <p style={{ marginTop: 16 }}><strong>Hours</strong></p>
              <p className="text-muted">Monday - Friday, 9:00 AM - 5:00 PM</p>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
      <TrustedPartners />
    </>
  );
}
