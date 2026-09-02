// AI-powered SEO / AEO / GEO assistant.
// Called from the admin panel when an author/editor clicks "AI Optimize" on a page/post.
//
// SEO  = classic search engines (Google/Bing ranking)
// AEO  = Answer Engine Optimization (voice assistants, Google AI Overviews)
// GEO  = Generative Engine Optimization (getting cited by ChatGPT/Perplexity/Claude/Gemini)

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(systemPrompt, userPrompt) {
  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((b) => b.type === 'text');
  return textBlock ? textBlock.text : '';
}

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// Generates meta title/description, focus keyword, an AEO answer summary,
// FAQ schema, and full structured data (schema.org JSON-LD) for a piece of content.
// Returns a plain object ready to merge into the content record.
async function optimizeContent({ title, bodyText, contentType, url }) {
  const system = `You are an SEO, AEO (answer engine optimization), and GEO (generative engine optimization) specialist for a digital marketing agency called Core Bit Media. Given a page's title and content, produce optimization metadata. Respond with ONLY valid JSON, no markdown fences, no preamble. The JSON schema must be exactly:
{
  "metaTitle": string (max 60 chars, compelling, includes focus keyword),
  "metaDescription": string (max 155 chars, action-oriented),
  "focusKeyword": string,
  "aiAnswerSummary": string (2-3 sentences, written so an AI assistant or featured snippet could quote it directly as a full answer to the implied user question),
  "faqSchema": [{"question": string, "answer": string}] (3-5 relevant Q&A pairs a user or AI model might ask about this content),
  "structuredData": object (a valid schema.org JSON-LD object appropriate to the content type: Service, Article, or WebPage, including "@context" and "@type"),
  "seoScore": number (0-100, honest assessment of how well-optimized the CURRENT content is, not the suggestions),
  "seoNotes": string (2-4 sentences of concrete, prioritized improvement advice)
}`;

  const user = `Content type: ${contentType}
URL: ${url}
Title: ${title}

Content:
${bodyText.slice(0, 6000)}`;

  const raw = await callClaude(system, user);
  return extractJson(raw);
}

// Generates descriptive, keyword-aware alt text for an image based on context.
async function generateAltText({ imageContext, pageTitle }) {
  const system = `You write concise, descriptive, accessible alt text for website images (max 125 characters). Respond with ONLY the alt text string, no quotes, no extra text.`;
  const user = `Page title: ${pageTitle}\nImage context: ${imageContext}`;
  const text = await callClaude(system, user);
  return text.trim();
}

// Suggests internal links from existing content that should be linked to/from this page.
async function suggestInternalLinks({ title, bodyText, existingPages }) {
  const system = `You are an internal linking strategist for SEO. Given the current page and a list of other pages on the site, suggest which existing pages should be linked FROM this content, and natural anchor text to use. Respond with ONLY valid JSON: {"suggestions": [{"targetSlug": string, "anchorText": string, "reason": string}]} — max 5 suggestions.`;
  const user = `Current page title: ${title}
Current page content:
${bodyText.slice(0, 3000)}

Other pages on the site (slug: title):
${existingPages.map((p) => `${p.slug}: ${p.title}`).join('\n')}`;

  const raw = await callClaude(system, user);
  return extractJson(raw);
}

module.exports = { optimizeContent, generateAltText, suggestInternalLinks };
