// Thin wrapper around Google's official `googleapis` client for the two
// GA4 surfaces this feature needs: the Admin API (to list which properties
// a connected Google account can see) and the Data API (to actually run a
// report). Direct API calls, not Google's official GA4 MCP server — that
// MCP server is for AI agents querying GA4 conversationally, and wraps
// these same underlying APIs; a public-facing web app calls them directly.

const { google } = require('googleapis');
const { decrypt } = require('./cryptoService');

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );
}

function getAuthUrl(state) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // forces a refresh token even on repeat connects
    // userinfo.email is needed to identify *which* Google account
    // connected (so repeat connects update the same Ga4Connection row
    // instead of creating duplicates) — without it, oauth2.userinfo.get()
    // in exchangeCode() fails with "missing required authentication
    // credential" because the access token has no scope covering it.
    scope: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    state
  });
}

async function exchangeCode(code) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data: profile } = await oauth2.userinfo.get();
  return { tokens, email: profile.email };
}

function clientFromRefreshToken(encryptedRefreshToken) {
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: decrypt(encryptedRefreshToken) });
  return client;
}

// Lists every GA4 property the connected account can see, across all of
// their accounts, flattened into one array.
async function listProperties(encryptedRefreshToken) {
  const auth = clientFromRefreshToken(encryptedRefreshToken);
  const admin = google.analyticsadmin({ version: 'v1beta', auth });
  const { data } = await admin.accountSummaries.list({ pageSize: 200 });

  const properties = [];
  for (const account of data.accountSummaries || []) {
    for (const p of account.propertySummaries || []) {
      properties.push({
        propertyId: p.property.replace('properties/', ''),
        displayName: p.displayName,
        accountName: account.displayName
      });
    }
  }
  return properties;
}

// One consistent, sensible default report: traffic trend over the last 30
// days plus top channels and top pages — enough for a genuinely useful
// first dashboard without needing a custom report builder for the MVP.
async function runReport(encryptedRefreshToken, propertyId) {
  const auth = clientFromRefreshToken(encryptedRefreshToken);
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate: '30daysAgo', endDate: 'today' }];

  const [trend, channels, pages, totals] = await Promise.all([
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges,
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      }
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges,
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8
      }
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges,
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 8
      }
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges,
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'engagementRate' },
          { name: 'conversions' }
        ]
      }
    })
  ]);

  const rowsOf = (res) => res.data.rows || [];

  return {
    trend: rowsOf(trend).map((r) => ({
      date: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value),
      users: Number(r.metricValues[1].value)
    })),
    channels: rowsOf(channels).map((r) => ({
      name: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value)
    })),
    topPages: rowsOf(pages).map((r) => ({
      path: r.dimensionValues[0].value,
      views: Number(r.metricValues[0].value)
    })),
    totals: (() => {
      const row = rowsOf(totals)[0];
      if (!row) return { sessions: 0, users: 0, engagementRate: 0, conversions: 0 };
      return {
        sessions: Number(row.metricValues[0].value),
        users: Number(row.metricValues[1].value),
        engagementRate: Number(row.metricValues[2].value),
        conversions: Number(row.metricValues[3].value)
      };
    })()
  };
}

module.exports = { getAuthUrl, exchangeCode, listProperties, runReport };
