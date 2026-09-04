// AI recommendations over a customer's own GA4 data. Same callClaude
// pattern as services/aiSeoService.js (duplicated here rather than
// imported from it, to avoid touching that live-admin-panel file at all).

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
      max_tokens: 1000,
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

// Given a report's GA4 snapshot, returns 3-5 prioritized, specific
// recommendations — not generic marketing advice, grounded in the actual
// numbers passed in.
async function getRecommendations(reportData) {
  if (!process.env.ANTHROPIC_API_KEY) return [];

  const system = `You are a web analytics consultant reviewing a client's Google Analytics 4 data. Given the JSON data below, return 3-5 specific, prioritized, actionable recommendations. Respond with ONLY valid JSON, no markdown fences, no preamble. Schema:
[{"title": string (short, specific), "detail": string (1-2 sentences, reference actual numbers from the data where relevant), "priority": "high" | "medium" | "low"}]`;

  const user = `GA4 data (last 30 days):\n${JSON.stringify(reportData)}`;

  const text = await callClaude(system, user);
  return extractJson(text);
}

module.exports = { getRecommendations };
