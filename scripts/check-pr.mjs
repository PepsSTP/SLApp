#!/usr/bin/env node
/**
 * Acceptance criteria checker for agent PRs.
 *
 * Reads the Linear issue linked in the PR title, fetches the PR diff,
 * asks Claude to verify each acceptance criterion, and posts the result
 * as a PR comment.
 *
 * Required env vars:
 *   GITHUB_TOKEN          - GitHub token (provided automatically in Actions)
 *   LINEAR_ACCESS_TOKEN   - Linear API key
 *   ANTHROPIC_API_KEY     - Anthropic API key
 *   PR_NUMBER             - Pull request number
 *   REPO                  - Repository in "owner/name" format
 */

const { GITHUB_TOKEN, LINEAR_ACCESS_TOKEN, ANTHROPIC_API_KEY, PR_NUMBER, REPO } = process.env;

function requireEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

// ---------------------------------------------------------------------------
// GitHub helpers
// ---------------------------------------------------------------------------

async function githubFetch(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${res.status} for ${path}: ${body}`);
  }
  return res.json();
}

async function getPrTitle(repo, prNumber) {
  const pr = await githubFetch(`/repos/${repo}/pulls/${prNumber}`);
  return pr.title;
}

async function getPrFiles(repo, prNumber) {
  // Returns at most 300 files; sufficient for agent PRs
  const files = await githubFetch(`/repos/${repo}/pulls/${prNumber}/files?per_page=100`);

  // Skip lock files and generated files that add noise but no signal
  const skip = /package-lock\.json|yarn\.lock|pnpm-lock\.yaml|\.snap$/;
  return files
    .filter((f) => !skip.test(f.filename) && f.patch)
    .map((f) => `### ${f.filename} (${f.status})\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join('\n\n');
}

async function postPrComment(repo, prNumber, body) {
  await githubFetch(`/repos/${repo}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });
}

// ---------------------------------------------------------------------------
// Linear helpers
// ---------------------------------------------------------------------------

async function getLinearIssue(identifier) {
  const query = `
    query($identifier: String!) {
      issueByIdentifier(identifier: $identifier) {
        title
        description
      }
    }
  `;

  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      Authorization: LINEAR_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables: { identifier } }),
  });

  if (!res.ok) throw new Error(`Linear API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  if (data.errors) throw new Error(`Linear GraphQL error: ${JSON.stringify(data.errors)}`);
  return data.data?.issueByIdentifier ?? null;
}

// ---------------------------------------------------------------------------
// Claude helper
// ---------------------------------------------------------------------------

async function reviewWithClaude(issueIdentifier, issueTitle, issueDescription, diffText) {
  const prompt = `You are reviewing a GitHub pull request against the acceptance criteria of a Linear issue.

## Linear issue: ${issueIdentifier} — ${issueTitle}

## Issue description (contains acceptance criteria):
${issueDescription}

## Changed files (diff):
${diffText.slice(0, 12000)}

---

Your task:
1. Find every acceptance criterion in the issue description (lines that look like "- [ ] ...").
2. For each criterion, decide:
   - ✅ **Met** — the diff clearly implements it
   - ❌ **Not met** — the diff clearly does NOT implement it
   - 🔍 **Needs manual review** — cannot be determined from code alone (visual behaviour, runtime correctness, UX, performance, browser testing)
3. Add a short (one-line) note explaining your reasoning.

Output a GitHub PR comment using exactly this format:

## Acceptance criteria check — ${issueIdentifier}

| Status | Criterion | Notes |
|--------|-----------|-------|
| ✅/❌/🔍 | criterion text | brief note |
... (one row per criterion)

---
*X of Y criteria verified from code. Remaining require manual review.*

> 🤖 Automated check — results may be incomplete for criteria that depend on runtime behaviour.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content[0].text;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  requireEnv('GITHUB_TOKEN');
  requireEnv('LINEAR_ACCESS_TOKEN');
  requireEnv('ANTHROPIC_API_KEY');
  const prNumber = requireEnv('PR_NUMBER');
  const repo = requireEnv('REPO');

  // 1. Get PR title and extract issue identifier
  const prTitle = await getPrTitle(repo, prNumber);
  console.log(`PR title: ${prTitle}`);

  const match = prTitle.match(/^([A-Z]+-\d+)[:\s]/);
  if (!match) {
    console.log('No issue identifier found in PR title — skipping review.');
    return;
  }
  const issueIdentifier = match[1];
  console.log(`Found issue: ${issueIdentifier}`);

  // 2. Fetch Linear issue
  const issue = await getLinearIssue(issueIdentifier);
  if (!issue) {
    console.log(`Linear issue ${issueIdentifier} not found — skipping review.`);
    return;
  }
  if (!issue.description) {
    console.log(`Linear issue ${issueIdentifier} has no description — skipping review.`);
    return;
  }

  const hasCriteria = issue.description.includes('- [ ]');
  if (!hasCriteria) {
    console.log('No acceptance criteria (- [ ] items) found in issue description — skipping review.');
    return;
  }

  // 3. Get PR diff
  console.log('Fetching PR diff...');
  const diffText = await getPrFiles(repo, prNumber);
  if (!diffText) {
    console.log('No reviewable file changes found — skipping review.');
    return;
  }

  // 4. Review with Claude
  console.log('Calling Claude for criteria review...');
  const comment = await reviewWithClaude(issueIdentifier, issue.title, issue.description, diffText);

  // 5. Post comment
  await postPrComment(repo, prNumber, comment);
  console.log('Posted acceptance criteria review comment.');
}

main().catch((err) => {
  console.error('check-pr error:', err.message);
  // Exit 0 so the workflow doesn't block the PR on a checker failure
  process.exit(0);
});
