// Bridges a customer's stored GA4 OAuth connection to Google's OFFICIAL GA4
// MCP server (googleanalytics/google-analytics-mcp, a Python package run
// via pipx — see ../../Dockerfile) so the AI chat's tool-use loop talks to
// the exact same server Claude Desktop would, instead of our own
// hand-rolled GA4 query tool.
//
// Google's server authenticates via Application Default Credentials read
// from GOOGLE_APPLICATION_CREDENTIALS. We don't have a service account per
// customer — what we have is each customer's OAuth refresh token
// (encrypted, see cryptoService.js). ADC's "authorized_user" credential
// type is exactly the shape `gcloud auth application-default login` itself
// writes: { type, client_id, client_secret, refresh_token }. Writing one of
// these per request, scoped to that customer's refresh token, is what lets
// the subprocess act as *that specific customer's* Google account with no
// gcloud CLI or service account involved at runtime.
//
// The credentials file only ever exists for the lifetime of one chat
// request, in a private temp dir, mode 0600, deleted in a `finally` — plus
// a periodic sweep below in case a crash ever skips that cleanup.

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const { decrypt } = require('./cryptoService');

const CREDS_DIR = path.join(os.tmpdir(), 'cbm-mcp-creds');
const MAX_CREDS_AGE_MS = 5 * 60 * 1000;

function writeAdcFile(refreshToken) {
  fs.mkdirSync(CREDS_DIR, { recursive: true, mode: 0o700 });
  const filePath = path.join(CREDS_DIR, `${crypto.randomBytes(16).toString('hex')}.json`);
  const adc = {
    type: 'authorized_user',
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: refreshToken
  };
  fs.writeFileSync(filePath, JSON.stringify(adc), { mode: 0o600 });
  return filePath;
}

function cleanupFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') console.error('[mcpGa4Client] Failed to remove temp credentials file:', err.message);
  });
}

// Opens one MCP session against Google's analytics-mcp server, authenticated
// as `connection`'s Google account, runs `callback(mcpClient)`, and always
// tears the subprocess + temp credentials file down afterward.
async function runWithMcpSession(connection, callback) {
  const refreshToken = decrypt(connection.encryptedRefreshToken);
  const credsFile = writeAdcFile(refreshToken);

  const transport = new StdioClientTransport({
    command: 'analytics-mcp',
    env: {
      ...process.env,
      GOOGLE_APPLICATION_CREDENTIALS: credsFile,
      GOOGLE_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID
    }
  });

  const client = new Client({ name: 'corebitmedia-dashboard', version: '1.0.0' });

  try {
    await client.connect(transport);
    return await callback(client);
  } finally {
    await client.close().catch(() => {});
    cleanupFile(credsFile);
  }
}

// Defense-in-depth: removes any leftover credentials file older than
// MAX_CREDS_AGE_MS, in case a prior crash skipped the `finally` above.
function sweepOrphanedCreds() {
  fs.readdir(CREDS_DIR, (err, files) => {
    if (err) return; // directory not created yet — nothing to sweep
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(CREDS_DIR, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) return;
        if (now - stats.mtimeMs > MAX_CREDS_AGE_MS) cleanupFile(filePath);
      });
    }
  });
}

function startCredsSweeper() {
  sweepOrphanedCreds();
  setInterval(sweepOrphanedCreds, 10 * 60 * 1000).unref();
}

module.exports = { runWithMcpSession, startCredsSweeper };
