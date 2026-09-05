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

  let tokens;
  try {
    ({ tokens } = await client.getToken(code));
  } catch (err) {
    err.ga4Step = 'getToken';
    throw err;
  }

  client.setCredentials(tokens);
  try {
    const oauth2 = google.oauth2({ version: 'v2', auth: client });
    const { data: profile } = await oauth2.userinfo.get();
    return { tokens, email: profile.email };
  } catch (err) {
    err.ga4Step = 'userinfo';
    throw err;
  }
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

// Maps our filter keys to the GA4 dimension they filter on, for building a
// dimensionFilter shared by every sub-report below.
const FILTER_DIMENSIONS = {
  channel: 'sessionDefaultChannelGroup',
  device: 'deviceCategory',
  country: 'country'
};

function buildDimensionFilter(filters = {}) {
  const expressions = Object.entries(filters)
    .filter(([key, value]) => FILTER_DIMENSIONS[key] && value)
    .map(([key, value]) => ({
      filter: {
        fieldName: FILTER_DIMENSIONS[key],
        stringFilter: { matchType: 'EXACT', value }
      }
    }));
  if (expressions.length === 0) return undefined;
  return expressions.length === 1 ? expressions[0] : { andGroup: { expressions } };
}

// One consistent, sensible default report: traffic trend plus top channels
// and top pages — enough for a genuinely useful dashboard without needing a
// custom report builder for the MVP. `options` lets callers override the
// default "last 30 days, no filters" (the interactive dashboard's date
// range + channel/device/country filters) without changing any of the
// existing call sites that don't pass it.
async function runReport(encryptedRefreshToken, propertyId, options = {}) {
  const { startDate = '30daysAgo', endDate = 'today', filters = {} } = options;
  const auth = clientFromRefreshToken(encryptedRefreshToken);
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const property = `properties/${propertyId}`;
  const dateRanges = [{ startDate, endDate }];
  const dimensionFilter = buildDimensionFilter(filters);

  const [trend, channels, pages, totals, devices, countries] = await Promise.all([
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges,
        dimensionFilter,
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
        orderBys: [{ dimension: { dimensionName: 'date' } }]
      }
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges,
        dimensionFilter,
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
        dimensionFilter,
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
        dimensionFilter,
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'engagementRate' },
          { name: 'conversions' }
        ]
      }
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges,
        dimensionFilter,
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
      }
    }),
    analyticsData.properties.runReport({
      property,
      requestBody: {
        dateRanges,
        dimensionFilter,
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 8
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
    devices: rowsOf(devices).map((r) => ({
      name: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value)
    })),
    countries: rowsOf(countries).map((r) => ({
      name: r.dimensionValues[0].value,
      sessions: Number(r.metricValues[0].value)
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

// Whitelisted dimensions/metrics for runFlexibleReport — the AI chat tool
// passes these straight through from the model's tool call, so this list is
// the actual security/cost boundary on what a customer's question can ask
// the Data API for, not just documentation.
const ALLOWED_DIMENSIONS = ['date', 'sessionDefaultChannelGroup', 'deviceCategory', 'country', 'pagePath'];
const ALLOWED_METRICS = ['sessions', 'activeUsers', 'engagementRate', 'conversions', 'screenPageViews'];

// A single, arbitrary-ish (dimension, metrics[]) report — the primitive the
// AI chat's `run_ga4_report` tool calls with whatever the model decides it
// needs to answer a question, as opposed to runReport()'s fixed bundle of
// six specific sub-reports for the dashboard UI.
async function runFlexibleReport(encryptedRefreshToken, propertyId, options = {}) {
  const { startDate = '30daysAgo', endDate = 'today', dimension, metrics, limit } = options;

  if (dimension && !ALLOWED_DIMENSIONS.includes(dimension)) {
    throw new Error(`Unsupported dimension: ${dimension}`);
  }
  const metricNames = (Array.isArray(metrics) && metrics.length ? metrics : ['sessions']).filter((m) => ALLOWED_METRICS.includes(m));
  if (metricNames.length === 0) throw new Error('No supported metrics requested');

  const auth = clientFromRefreshToken(encryptedRefreshToken);
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

  const requestBody = {
    dateRanges: [{ startDate, endDate }],
    metrics: metricNames.map((name) => ({ name }))
  };
  if (dimension) {
    requestBody.dimensions = [{ name: dimension }];
    requestBody.orderBys = [{ metric: { metricName: metricNames[0] }, desc: true }];
    requestBody.limit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  }

  const { data } = await analyticsData.properties.runReport({ property: `properties/${propertyId}`, requestBody });

  return (data.rows || []).map((r) => {
    const row = {};
    if (dimension) row[dimension] = r.dimensionValues[0].value;
    metricNames.forEach((name, i) => { row[name] = Number(r.metricValues[i].value); });
    return row;
  });
}

module.exports = {
  getAuthUrl,
  exchangeCode,
  listProperties,
  runReport,
  runFlexibleReport,
  ALLOWED_DIMENSIONS,
  ALLOWED_METRICS
};
