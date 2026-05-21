# Build stage: compile TypeScript
FROM node:22-slim AS build
WORKDIR /agent
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build

# Runtime stage
FROM node:22-slim
RUN apt-get update && apt-get install -y git jq && rm -rf /var/lib/apt/lists/*

# Git identity for commits
RUN git config --global user.email "agent@slapp.local" && \
    git config --global user.name "SLApp Agent"

WORKDIR /agent
COPY package*.json ./
# Production install includes @anthropic-ai/claude-agent-sdk (bundles the claude CLI)
RUN npm ci --omit=dev

COPY bin ./bin
COPY --from=build /agent/dist ./dist

# The repo is mounted here at runtime: -v $(pwd):/workspace
WORKDIR /workspace
ENV PATH="/agent/bin:$PATH"

# Usage:
#   docker build -t slapp-agent -f agent/Dockerfile agent/
#   docker run --rm \
#     -v $(pwd):/workspace \
#     -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
#     -e LINEAR_ACCESS_TOKEN=$LINEAR_ACCESS_TOKEN \
#     -e GITHUB_TOKEN=$GITHUB_TOKEN \
#     -e SLACK_WEBHOOK_URL=$SLACK_WEBHOOK_URL \
#     slapp-agent
#
# For production, add egress firewall rules to restrict network to:
#   api.anthropic.com, api.linear.app, api.github.com, github.com, hooks.slack.com

ENTRYPOINT ["node", "/agent/dist/index.js"]
