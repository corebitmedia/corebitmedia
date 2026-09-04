import Link from 'next/link';
import { getBlogPosts } from '../../lib/api';

export const metadata = {
  title: 'Blogs',
  description: 'Insights on SEO, analytics, and digital marketing from the Core Bit Media team.',
  alternates: { canonical: '/blogs/' }
};

export default async function BlogsPage() {
  const posts = await getBlogPosts();

  return (
    <section className="section">
      <div className="container" style={{ textAlign: 'center', maxWidth: 720, margin: '0 auto 48px' }}>
        <div className="eyebrow">Check Our Latest Blogs</div>
        <h1>Latest Blogs</h1>
      </div>
      <div className="container grid grid-4">
        {posts.map((p) => (
          <Link href={`/blogs/${p.slug}/`} key={p.slug} className="card" style={{ padding: 15 }}>
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
        {posts.length === 0 && <p className="text-muted">Blog posts will appear here once published from the admin panel.</p>}
      </div>
    </section>
  );
}
