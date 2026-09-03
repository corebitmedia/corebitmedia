import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBlogPosts, getBlogPost } from '../../../lib/api';
import StructuredData from '../../../components/StructuredData';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  // Next's `output: export` mode fails the whole build with a misleading
  // "missing generateStaticParams()" error if this ever returns a truly
  // empty array (e.g. the backend was unreachable at build time, or there
  // are simply no published posts yet). A placeholder slug that resolves to
  // notFound() below avoids that without needing real data to exist.
  if (posts.length === 0) return [{ slug: '_none' }];
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    alternates: { canonical: `/blogs/${post.slug}/` },
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      url: `/blogs/${post.slug}/`,
      type: 'article',
      images: post.coverImageUrl ? [post.coverImageUrl] : []
    }
  };
}

export default async function BlogPostPage({ params }) {
  const post = await getBlogPost(params.slug);
  if (!post) notFound();

  const allPosts = await getBlogPosts();
  const morePosts = allPosts.filter((p) => p.slug !== params.slug).slice(0, 3);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corebitmedia.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.corebitmedia.com/blogs/' },
      { '@type': 'ListItem', position: 3, name: post.title, item: `https://www.corebitmedia.com/blogs/${post.slug}/` }
    ]
  };

  // Falls back to a computed Article schema when the CMS record doesn't
  // already carry its own `structuredData` (e.g. not yet filled in via the
  // AI SEO assistant) — Google's rich-result eligibility for articles
  // depends on this being present, so every post should have one or the other.
  const articleSchema = post.structuredData || {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: { '@type': post.author?.name ? 'Person' : 'Organization', name: post.author?.name || 'Core Bit Media' },
    publisher: {
      '@type': 'Organization',
      name: 'Core Bit Media',
      logo: { '@type': 'ImageObject', url: 'https://media.corebitmedia.com/wp-content/uploads/2025/07/logo-corebitmedia1-2.png' }
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.corebitmedia.com/blogs/${post.slug}/` }
  };

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={breadcrumbSchema} />
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
