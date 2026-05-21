import { buildBranchName, setupBranch, publish } from './publisher.js';
import { implement } from './developer.js';
import { review } from './reviewer.js';
import { exec } from './utils.js';
import type { AgentIssue } from './types.js';

const MAX_ATTEMPTS = 2;

const BLOCKERS = [
  { pattern: /\bauth(entication|orization)?\b/i, reason: 'touches authentication — needs human review' },
  { pattern: /\bexternal api\b/i, reason: 'involves external API changes — needs human review' },
  { pattern: /\barchitecture\b/i, reason: 'architecture decision — needs human review' },
];

function triage(issue: AgentIssue): { ok: boolean; reason?: string } {
  const text = `${issue.title} ${issue.description ?? ''}`;
  for (const { pattern, reason } of BLOCKERS) {
    if (pattern.test(text)) return { ok: false, reason };
  }
  if (!issue.description || issue.description.trim().length < 50) {
    return { ok: false, reason: 'description too short to implement safely — add more detail to the issue' };
  }
  return { ok: true };
}

// Strips GITHUB_TOKEN from the environment before running agent subprocesses
// so they cannot push or call the GitHub API. Restores it afterwards.
async function withAgentEnv<T>(fn: () => Promise<T>): Promise<T> {
  const savedToken = process.env.GITHUB_TOKEN;
  process.env.SLAPP_AGENT_SUBPROCESS = '1';
  delete process.env.GITHUB_TOKEN;
  try {
    return await fn();
  } finally {
    delete process.env.SLAPP_AGENT_SUBPROCESS;
    if (savedToken !== undefined) process.env.GITHUB_TOKEN = savedToken;
  }
}

export type OrchestrationResult =
  | { type: 'skipped'; reason: string }
  | { type: 'completed'; prUrl: string }
  | { type: 'failed'; error: string };

export async function orchestrate(issue: AgentIssue): Promise<OrchestrationResult> {
  const triageResult = triage(issue);
  if (!triageResult.ok) {
    return { type: 'skipped', reason: triageResult.reason! };
  }

  const branchName = buildBranchName(issue);
  console.log(`\n📌 Branch: ${branchName}`);
  setupBranch(branchName);

  let feedback: string | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`\n🔄 Attempt ${attempt}/${MAX_ATTEMPTS}`);

    await withAgentEnv(() => implement(issue, feedback));

    const reviewResult = await withAgentEnv(() => review(issue));

    if (reviewResult.approved) {
      console.log(`\n✅ Reviewer approved on attempt ${attempt}`);
      break;
    }

    console.log(`\n❌ Reviewer rejected (attempt ${attempt}): ${reviewResult.feedback}`);
    feedback = reviewResult.feedback;

    if (attempt === MAX_ATTEMPTS) {
      exec('git checkout main');
      exec(`git branch -D ${branchName}`);
      return {
        type: 'failed',
        error: `Reviewer rejected after ${MAX_ATTEMPTS} attempts:\n${reviewResult.feedback}`,
      };
    }
  }

  const prUrl = await publish(branchName, issue);
  return { type: 'completed', prUrl };
}
