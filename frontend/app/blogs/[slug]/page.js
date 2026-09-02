import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPosts, getBlogPost } from '../../../lib/api';
import StructuredData from '../../../components/StructuredData';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: { images: post.coverImageUrl ? [post.coverImageUrl] : [] }
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const allPosts = await getBlogPosts();
  const morePosts = allPosts.filter((p) => p.slug !== params.slug).slice(0, 3);

  return (
    <>
      <StructuredData data={post.structuredData} />
      <article className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <Link href="/blogs/" className="text-muted" style={{ fontSize: 14, display: 'inline-block', marginBottom: 16 }}>&larr; All Blogs</Link>
          <div className="eyebrow">{post.category || 'Blog'}</div>
          <h1>{post.title}</h1>
          <p className="text-muted" style={{ marginTop: 8 }}>
            {post.author?.name ? `By ${post.author.name} · ` : ''}
            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ''}
          </p>

          {post.aiAnswerSummary && (
            <div className="card" style={{ marginTop: 24, background: 'var(--bg-alt)' }}>
              <strong style={{ color: 'var(--teal-dark)' }}>Quick Answer</strong>
              <p style={{ marginTop: 8 }}>{post.aiAnswerSummary}</p>
            </div>
          )}

          {post.coverImageUrl && <img src={post.coverImageUrl} alt={post.title} style={{ width: '100%', borderRadius: 12, margin: '32px 0' }} />}

          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.9, fontSize: 17 }}>{post.body}</div>

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <Link href="/contact-us/" className="btn">Talk To Our Team</Link>
          </div>
        </div>
      </article>

      {morePosts.length > 0 && (
        <section className="section section-alt">
          <div className="container" style={{ maxWidth: 720, margin: '0 auto 32px', textAlign: 'center' }}>
            <div className="eyebrow">Keep Reading</div>
            <h2>More From The Blog</h2>
          </div>
          <div className="container grid grid-3">
            {morePosts.map((p) => (
              <Link href={`/blogs/${p.slug}/`} key={p.slug} className="card">
                {p.coverImageUrl && <img src={p.coverImageUrl} alt={p.title} style={{ borderRadius: 8, marginBottom: 16 }} />}
                <h3>{p.title}</h3>
                <p className="text-muted" style={{ marginTop: 10, fontSize: 14 }}>{p.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
