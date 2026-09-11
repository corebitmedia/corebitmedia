import Link from 'next/link';
import { getBlogPosts } from '../../lib/api';

export const metadata = {
  title: 'Resources',
  description: 'Insights on SEO, analytics, and digital marketing from the Core Bit Media team.',
  alternates: { canonical: '/resources/' }
};

export default async function ResourcesPage() {
  const posts = await getBlogPosts();

  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
        <div className="eyebrow">Guides, Insights & Updates</div>
        <h1>Resources</h1>
      </div>
      <div className="container grid grid-4">
        {posts.map((p) => (
          <Link href={`/resources/${p.slug}/`} key={p.slug} className="card" style={{ padding: 15 }}>
            {p.coverImageUrl && (
              <img
                src={p.coverImageUrl}
                alt={p.title}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '1 / 0.48', objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
              />
            )}
            <h3 style={{ fontSize: 18, color: '#232358' }}>{p.title}</h3>
            <span style={{ marginTop: 10, display: 'inline-block', fontSize: 16, fontWeight: 600, color: '#232358' }}>Read More &raquo;</span>
          </Link>
        ))}
        {posts.length === 0 && <p className="text-muted">Resources will appear here once published from the admin panel.</p>}
      </div>
    </section>
  );
}
