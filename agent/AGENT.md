# SLApp Dev Agent

An autonomous developer agent that picks up Linear issues assigned to **Claude Agent**, implements them, has them reviewed, and opens a pull request — without human involvement.

## How it's triggered

1. A Linear issue is assigned to **Claude Agent** (must be in **Todo** state)
2. Linear fires a webhook to the Railway backend (`POST /webhook/linear`)
3. Railway validates the HMAC signature and calls GitHub's `repository_dispatch` API
4. GitHub Actions starts the **Dev Agent** workflow (`.github/workflows/agent.yml`)
5. The agent runs once and exits

A daily fallback cron (`0 8 * * *`) catches any issues the webhook missed. Manual runs are also available via `workflow_dispatch`.

## Running locally

```bash
cd agent
npm run dev        # daemon mode — polls Linear every 60 seconds
```

The `dev` script sets `AGENT_DAEMON=true`. GitHub Actions runs without that flag (single-run, then exits).

Required env vars (copy `.env.example` to `.env`):

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API access |
| `LINEAR_ACCESS_TOKEN` | Read issues, update states, post comments |
| `GITHUB_TOKEN` | Push branches and open PRs |
| `SLACK_WEBHOOK_URL` | Progress notifications |

## Issue lifecycle

```
Todo → In Progress → In Review → Done
```

- **Todo**: agent picks it up
- **In Progress**: set immediately when the agent starts work
- **In Review**: set when a PR is created
- The agent posts the PR link as a comment on the Linear issue

## What the agent will skip

The orchestrator triages issues before starting work. It returns `skipped` (moves the issue back to Todo with a comment) if:

- The description is under 50 characters
- The title or description matches: `auth`, `external api`, or `architecture`

These are routed back to a human.

## Inner loop

```
triage → setup branch → [ implement → review → (retry?) ] → publish PR
```

1. **Orchestrator** (`src/orchestrator.ts`) — controls the loop, handles GITHUB_TOKEN isolation, branch lifecycle
2. **Developer** (`src/developer.ts`) — Claude agent with read/write/bash tools. Reads SPEC.md, implements the issue, runs lint and tests, commits. Does NOT push.
3. **Reviewer** (`src/reviewer.ts`) — read-only Claude agent. Reads the diff, checks acceptance criteria, outputs `{"approved": bool, "feedback": "..."}`. Two attempts max; on final rejection the branch is deleted.
4. **Publisher** (`src/publisher.ts`) — the only place that holds GITHUB_TOKEN. Pushes the branch and opens the PR via the GitHub API.

## Guardrails

**Token isolation**: `GITHUB_TOKEN` is removed from the environment before any `query()` call and restored afterwards. Developer and reviewer agents cannot push or call the GitHub API.

**Bash hook** (`.claude/hooks/agent-bash-guard.sh`): active only when `SLAPP_AGENT_SUBPROCESS=1`. Blocks `git push`, `git config --global`, `curl`, `wget`, `rm -rf`, `npm install`, `npm ci`.

**Lint-on-edit hook** (`.claude/hooks/lint-on-edit.sh`): runs ESLint on any `.ts`/`.tsx` file the developer edits. Output is shown as feedback to the agent.

**Reviewer**: read-only tool set (`Read`, `Bash`, `Glob`, `Grep`). Cannot write or commit.

**MAX_ATTEMPTS = 2**: if the reviewer rejects twice, the branch is deleted and the issue is marked failed.

## Branch naming

```
agent/{linear-identifier}-{slug}
```

Example: `agent/pep-11-add-openapi-swagger-documentation`

## What issues the agent handles well

- UI improvements and bug fixes with clear acceptance criteria
- Well-scoped backend features (new endpoints, service logic)
- Anything where the expected behaviour can be stated as checkboxes

## What needs a human

- Authentication or authorization changes
- External API integrations
- Architecture decisions
- Any issue where the acceptance criteria are ambiguous or missing
