# Node backend + a Python runtime for Google's official GA4 MCP server
# (the `analytics-mcp` PyPI package — see src/services/mcpGa4Client.js).
# Render's native Node buildpack has no Python, so the AI chat feature
# needs this Docker-based deploy instead — see backend/.env.example and the
# project notes for the Render dashboard setting this requires.
FROM node:20-slim

# python3-venv is required by pipx to build the isolated environment it
# installs analytics-mcp into.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 python3-pip python3-venv pipx \
    && rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:${PATH}"
# Installed once at build time (not `pipx run`, which would rebuild the
# venv on every cold start) so every chat request just execs the already-
# built `analytics-mcp` binary.
RUN pipx install analytics-mcp

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/server.js"]
