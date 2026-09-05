// AI chat over a customer's own GA4 data, backed by Google's OFFICIAL GA4
// MCP server (see mcpGa4Client.js) rather than a hand-rolled tool — Claude
// gets whatever tools that server exposes today (run_report,
// run_realtime_report, run_funnel_report, run_conversions_report,
// get_account_summaries, get_property_details, list_property_annotations,
// get_custom_dimensions_and_metrics, list_google_ads_links) and calls them
// itself. Same callClaude-over-fetch pattern as aiSeoService.js/
// ga4AiService.js, extended with tool use.

const { runWithMcpSession } = require('./mcpGa4Client');

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const MAX_TOOL_ITERATIONS = 6;
// The MCP server's own tool descriptions include several KB of filter/
// date-range examples per tool (verified directly against the real
// server — see mcpGa4Client.js) — useful for a human reading the docs, but
// sent as-is they'd multiply the token cost of every single chat turn.
// The first few hundred characters (the Args summary) carry the part that
// actually matters for picking the right tool/arguments; our own system
// prompt below covers the property id every tool needs.
const MAX_TOOL_DESCRIPTION_LENGTH = 600;

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

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// MCP tool schemas are already JSON Schema, same as Anthropic's
// input_schema — this is a field rename plus the description trim above,
// not a format translation.
function mcpToolsToAnthropicTools(mcpTools) {
  return mcpTools.map((t) => ({
    name: t.name,
    description: truncate(t.description || '', MAX_TOOL_DESCRIPTION_LENGTH),
    input_schema: t.inputSchema
  }));
}

// `priorMessages` is plain { role, content } text turns from Ga4ChatMessage
// history (not the tool-call scaffolding of a past turn, which is
// deliberately not persisted — see ga4Routes.js). `question` is the new
// user message for this turn.
async function askQuestion(connection, priorMessages, question) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('AI chat is not configured (missing ANTHROPIC_API_KEY)');
  }

  const propertyId = connection.propertyId;
  const system = `You are a Google Analytics 4 data assistant for the property "${connection.propertyDisplayName || propertyId}" (property_id: ${propertyId}). Today's date is ${new Date().toISOString().slice(0, 10)}. Always pass property_id="${propertyId}" to every tool call unless the customer explicitly asks about a different property. Use the available tools to fetch real data before answering — never estimate or invent numbers. Keep answers short and concrete, citing the actual figures you retrieved. If a question is ambiguous about date range, default to the last 30 days and say so.`;

  const messages = [...priorMessages, { role: 'user', content: question }];

  return runWithMcpSession(connection, async (mcpClient) => {
    const { tools: mcpTools } = await mcpClient.listTools();
    const tools = mcpToolsToAnthropicTools(mcpTools);

    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const data = await callClaude(system, messages, tools);

      if (data.stop_reason !== 'tool_use') {
        return textFrom(data.content);
      }

      messages.push({ role: 'assistant', content: data.content });

      const toolResults = [];
      for (const block of data.content) {
        if (block.type !== 'tool_use') continue;
        let resultContent;
        try {
          const result = await mcpClient.callTool({ name: block.name, arguments: block.input });
          resultContent = JSON.stringify(result.content);
        } catch (err) {
          resultContent = JSON.stringify({ error: err.message });
        }
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: resultContent });
      }
      messages.push({ role: 'user', content: toolResults });
    }

    return "I wasn't able to pull that data in time — try asking a more specific question.";
  });
}

module.exports = { askQuestion };
