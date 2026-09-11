import Link from 'next/link';
import { getIndustries } from '../../lib/api';

export const metadata = {
  title: 'Industries',
  description: 'Analytics, experimentation, and marketing services tailored to the industries Core Bit Media works in.',
  alternates: { canonical: '/industries/' }
};

export default async function IndustriesPage() {
  const industries = await getIndustries();

  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
        <div className="eyebrow">Built For Your Industry</div>
        <h1>Industries We Serve</h1>
      </div>
      <div className="container grid grid-3">
        {industries.map((ind) => (
          <Link href={`/industries/${ind.slug}/`} key={ind.slug} className="card" style={{ padding: 15 }}>
            {ind.heroImageUrl && (
              <img
                src={ind.heroImageUrl}
                alt={ind.title}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '1 / 0.5', objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
              />
            )}
            <h3 style={{ fontSize: 18, color: '#232358' }}>{ind.title}</h3>
            <p style={{ marginTop: 10, fontSize: 14, color: '#23242C' }}>{ind.shortDescription}</p>
            <span style={{ marginTop: 10, display: 'inline-block', fontSize: 15, fontWeight: 600, color: '#232358' }}>Read More &raquo;</span>
          </Link>
        ))}
        {industries.length === 0 && <p className="text-muted">Industry pages will appear here once published from the admin panel.</p>}
      </div>
    </section>
  );
}
