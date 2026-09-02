import StructuredData from './StructuredData';

export default function FaqSection({ faqs, title = 'Frequently Asked Questions' }) {
  if (!faqs || faqs.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }))
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 40 }}>{title}</h2>
        <StructuredData data={faqSchema} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {faqs.map((f, i) => (
            <details key={i} className="card" style={{ padding: 20 }}>
              <summary style={{ fontWeight: 700, cursor: 'pointer', color: 'var(--navy)' }}>{f.question}</summary>
              <p className="text-muted" style={{ marginTop: 12 }}>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
