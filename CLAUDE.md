# SLApp — Claude Policies & Conventions

## Communication style
- Be concise. Lead with the answer, not the reasoning.
- No emojis unless asked.
- When referencing code, use file:line links so I can navigate directly.

## Project
SLApp is a Stockholm public transport departure dashboard.
- Frontend: React/Vite on Vercel
- Backend: Express on Railway
- Repo: github.com/PepsSTP/SLApp
- Main branch: `main` (production), `Development` (staging/integration)

## Linear
- Team: PEP
- Workflow states: Todo → In Progress → In Review → Done
- Always move an issue to the correct state when acting on it
- When creating issues: include what, why, and clear acceptance criteria
- Issue descriptions should be self-contained — assume no extra context
- Never close or delete an issue without a comment explaining why
- Assign to "Claude Agent" only for work that is fully autonomous (no human decision needed mid-task)
- Issues the agent can handle: UI improvements, bug fixes, well-scoped features
- Issues that need a human: architecture decisions, external API changes, anything touching auth

## Slack
- Notifications should be brief: what happened + a link, nothing more
- No @channel or @here unless it's a production incident
- Automated messages go in dedicated channels only (not #general or conversation channels)
- Don't send a Slack message for something that was already communicated in Linear
- `#dev-alerts` (or equivalent): CI results, deploy notifications, agent progress — automated only
- Deploy notifications fire when a push to `main` passes CI (triggers Vercel + Railway deploy)

## GitHub
- Prefer small, focused PRs — one concern per PR
- PR description must include: what changed, why, and a test plan
- Never force-push to main or shared branches
- Commit messages: imperative mood, explain the why not the what
- Agent branches: `agent/{pep-identifier}-{slug}` (e.g. `agent/pep-5-add-mobile-layout`)
- Feature branches: `feature/{description}`
- PRs merge into `main`; `Development` is synced from main after PRs are merged
- CI runs tests + build on every push; Slack notified on result

## Dev agent
- Picks up Linear issues assigned to "Claude Agent" in Todo state, every 60 seconds
- Moves issue: Todo → In Progress (on start) → In Review (on PR created)
- Posts PR link as a comment on the Linear issue when done
- Run locally: `cd agent && npm run dev`
- Always read SPEC.md before starting implementation
- If your changes affect any behaviour described in SPEC.md (time windows, component structure, API shape, routes, non-functional requirements), update the relevant section in the same commit

## Code conventions
- TypeScript throughout (strict mode)
- Tests required for backend logic; frontend tests for hooks and utils
- Run before committing: `cd backend && npm test` and `cd frontend && npm test`
- No `console.log` left in production code
