// AI chat over a customer's own GA4 data. Same callClaude pattern as
// services/aiSeoService.js / ga4AiService.js (duplicated here rather than
// imported, to avoid touching those live files), extended with Anthropic
// tool use — new to this codebase — so the model can pull whatever GA4
// slice a question actually needs instead of guessing from a fixed snapshot.

const ga4Service = require('./ga4Service');

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MAX_TOOL_ITERATIONS = 4;

const RUN_GA4_REPORT_TOOL = {
  name: 'run_ga4_report',
  description: 'Run a Google Analytics 4 report for this property and return the rows. Always call this to get real numbers before answering — never estimate or make up data.',
  input_schema: {
    type: 'object',
    properties: {
      startDate: { type: 'string', description: 'GA4 date format, e.g. "7daysAgo", "30daysAgo", "90daysAgo", or "YYYY-MM-DD"' },
      endDate: { type: 'string', description: 'GA4 date format, e.g. "today" or "YYYY-MM-DD"' },
      dimension: { type: 'string', enum: ga4Service.ALLOWED_DIMENSIONS, description: 'Optional. Omit for a totals-only report with no breakdown.' },
      metrics: { type: 'array', items: { type: 'string', enum: ga4Service.ALLOWED_METRICS }, minItems: 1 },
      limit: { type: 'number', description: 'Max rows when a dimension is given, default 10, max 50' }
    },
    required: ['startDate', 'endDate', 'metrics']
  }
};

async function callClaude(system, messages, tools) {
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
      system,
      messages,
      tools
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${errText}`);
  }
  return response.json();
}

function textFrom(content) {
  const block = content.find((b) => b.type === 'text');
  return block ? block.text : '';
}

// `priorMessages` is plain { role, content } text turns from Ga4ChatMessage
// history (not the tool-call scaffolding of a past turn, which is
// deliberately not persisted — see ga4Routes.js). `question` is the new
// user message for this turn.
async function askQuestion(connection, priorMessages, question) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('AI chat is not configured (missing ANTHROPIC_API_KEY)');
  }

  const system = `You are a Google Analytics 4 data assistant for the property "${connection.propertyDisplayName || connection.propertyId}". Today's date is ${new Date().toISOString().slice(0, 10)}. Answer the customer's question about their own website traffic using the run_ga4_report tool to fetch real numbers — never estimate or invent data. Keep answers short and concrete, citing the actual figures you retrieved. If a question is ambiguous about date range, default to the last 30 days and say so.`;

  const messages = [...priorMessages, { role: 'user', content: question }];

  for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
    const data = await callClaude(system, messages, [RUN_GA4_REPORT_TOOL]);

    if (data.stop_reason !== 'tool_use') {
      return textFrom(data.content);
    }

    messages.push({ role: 'assistant', content: data.content });

    const toolResults = [];
    for (const block of data.content) {
      if (block.type !== 'tool_use') continue;
      let resultContent;
      try {
        const rows = await ga4Service.runFlexibleReport(connection.encryptedRefreshToken, connection.propertyId, block.input);
        resultContent = JSON.stringify(rows);
      } catch (err) {
        resultContent = JSON.stringify({ error: err.message });
      }
      toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: resultContent });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  return "I wasn't able to pull that data in time — try asking a more specific question.";
}

module.exports = { askQuestion };
