const MEDIA = 'https://media.corebitmedia.com/wp-content/uploads';

// Partner/client badge strip — appears on Home, About Us, and Contact Us on
// the live site as an auto-scrolling logo carousel (Elementor's
// "nested-carousel" widget). Same six badge images (p1–p6) confirmed from
// the WordPress database export.
const LOGOS = [1, 2, 3, 4, 5, 6].map((n) => `${MEDIA}/2025/06/p${n}.jpg`);
// Duplicated once so the CSS marquee can loop seamlessly (scrolls -50%, i.e.
// exactly one full copy of the list, then resets invisibly).
const MARQUEE_LOGOS = [...LOGOS, ...LOGOS];

export default function TrustedPartners() {
  return (
    <section style={{ padding: '40px 0' }}>
      <div className="container">
        <div className="eyebrow" style={{ textAlign: 'center' }}>Trusted Partners</div>
        <div className="marquee">
          <div className="marquee-track">
            {MARQUEE_LOGOS.map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Partner badge"
                style={{ height: 56, width: 'auto', objectFit: 'contain' }}
                loading="lazy"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
