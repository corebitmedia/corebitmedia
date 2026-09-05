'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { customerApi, isLoggedIn } from '../../../lib/customerApi';

const codeStyle = {
  display: 'block',
  background: 'var(--navy)',
  color: '#e2e8f0',
  padding: 14,
  borderRadius: 8,
  fontSize: 12.5,
  overflowX: 'auto',
  whiteSpace: 'pre'
};

function CopyBlock({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: 16 }}>
      <pre style={codeStyle}>{text}</pre>
      <button
        type="button"
        className="btn btn-outline btn-sm"
        style={{ position: 'absolute', top: 8, right: 8 }}
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function McpSetupDetail() {
  const params = useSearchParams();
  const id = params.get('id');
  const [status, setStatus] = useState('loading');
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      window.location.href = '/dashboard/login/';
      return;
    }
    if (!id) {
      setStatus('notfound');
      return;
    }
    customerApi.get(`/api/ga4/my/connections/${id}`)
      .then((data) => {
        setConnection(data);
        setStatus('ready');
      })
      .catch(() => setStatus('notfound'));
  }, [id]);

  if (status === 'loading') {
    return <p className="text-muted" style={{ textAlign: 'center' }}>Loading…</p>;
  }
  if (status === 'notfound' || !connection) {
    return (
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <p>This property isn't available.</p>
        <a href="/dashboard/" className="btn" style={{ marginTop: 16 }}>Back to Dashboard</a>
      </div>
    );
  }

  const configSnippet = `{
  "mcpServers": {
    "analytics-mcp": {
      "command": "pipx",
      "args": ["run", "analytics-mcp"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "PATH_TO_YOUR_CREDENTIALS_JSON",
        "GOOGLE_PROJECT_ID": "YOUR_GOOGLE_CLOUD_PROJECT_ID"
      }
    }
  }
}`;

  return (
    <>
      <a href={`/dashboard/view/?id=${id}`} className="text-muted" style={{ fontSize: 14, display: 'inline-block', marginBottom: 16 }}>&larr; Back to Dashboard</a>
      <div className="eyebrow">Claude Desktop</div>
      <h1 style={{ marginBottom: 12 }}>Connect {connection.propertyDisplayName} via Google's GA4 MCP Server</h1>
      <p className="text-muted" style={{ marginBottom: 24 }}>
        Google publishes an official, read-only MCP (Model Context Protocol) server for Google
        Analytics 4 — it lets an AI assistant like Claude Desktop query your GA4 property
        directly and conversationally. It's a separate tool that runs on your own computer, not
        something we host for you.{' '}
        <a href="https://github.com/googleanalytics/google-analytics-mcp" target="_blank" rel="noreferrer">
          View the project on GitHub →
        </a>
      </p>

      <div className="card" style={{ marginBottom: 24, borderLeft: '3px solid var(--gold)' }}>
        <strong style={{ fontSize: 14 }}>Important: this needs your own Google Cloud credentials</strong>
        <p className="text-muted" style={{ fontSize: 13, marginTop: 6 }}>
          The connection you set up on this dashboard uses a login token that's only valid for
          our servers — Google's official MCP server can't use it. To connect Claude Desktop,
          you'll authenticate separately with your own Google Cloud project (it's free to create)
          using either your Google login or a service account.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>Your property details</h3>
        <p style={{ fontSize: 14, marginBottom: 4 }}><strong>Property ID:</strong> {connection.propertyId}</p>
        <p style={{ fontSize: 14 }}><strong>Connected Google account:</strong> {connection.googleEmail}</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>1. Install the server</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 10 }}>Requires Python + pipx installed on your computer.</p>
        <CopyBlock text="pipx run analytics-mcp" />
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 12 }}>2. Authenticate with your Google Cloud project</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 10 }}>
          Create/select a project in the Google Cloud Console, enable the Google Analytics Data
          and Admin APIs, then run:
        </p>
        <CopyBlock text="gcloud auth application-default login" />
        <p className="text-muted" style={{ fontSize: 13 }}>
          Make sure the account you log in with has access to property {connection.propertyId}
          {' '}(e.g. {connection.googleEmail}, if that's a Google account you can sign into directly).
        </p>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>3. Add it to Claude Desktop</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 10 }}>
          Add this to your <code>claude_desktop_config.json</code>, then restart Claude Desktop:
        </p>
        <CopyBlock text={configSnippet} />
        <p className="text-muted" style={{ fontSize: 13 }}>
          Once connected, you can ask Claude things like "What were my top landing pages for
          property {connection.propertyId} last week?" and it will query GA4 directly.
        </p>
      </div>
    </>
  );
}

export default function McpSetupPage() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 900 }}>
        <Suspense fallback={null}>
          <McpSetupDetail />
        </Suspense>
      </div>
    </section>
  );
}
