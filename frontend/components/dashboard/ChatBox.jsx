'use client';

import { useEffect, useRef, useState } from 'react';
import { customerApi } from '../../lib/customerApi';

export default function ChatBox({ connectionId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    customerApi.get(`/api/ga4/my/connections/${connectionId}/chat`)
      .then(({ messages }) => setMessages(messages))
      .finally(() => setLoaded(true));
  }, [connectionId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, sending]);

  async function send(e) {
    e.preventDefault();
    const question = input.trim();
    if (!question || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setSending(true);
    try {
      const { reply } = await customerApi.post(`/api/ga4/my/connections/${connectionId}/chat`, { message: question });
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` }]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}>Ask AI About Your Data</h3>

      <div ref={listRef} style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {loaded && messages.length === 0 && (
          <p className="text-muted" style={{ fontSize: 13 }}>
            Ask a question about this property's traffic, e.g. "How many sessions came from organic search last week?"
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.role === 'user' ? 'var(--navy)' : 'var(--bg-alt)',
              color: m.role === 'user' ? 'white' : 'inherit',
              padding: '8px 12px',
              borderRadius: 10,
              fontSize: 13,
              whiteSpace: 'pre-wrap'
            }}
          >
            {m.content}
          </div>
        ))}
        {sending && <div className="text-muted" style={{ fontSize: 13, alignSelf: 'flex-start' }}>Thinking…</div>}
      </div>

      <form onSubmit={send} style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your traffic…"
          disabled={sending}
          style={{ flex: 1, padding: 10, border: '1px solid var(--border)', borderRadius: 6 }}
        />
        <button type="submit" className="btn btn-sm" disabled={sending || !input.trim()}>Send</button>
      </form>
    </div>
  );
}
