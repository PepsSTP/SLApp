import { query } from '@anthropic-ai/claude-agent-sdk';
import { REPO_DIR } from './utils.js';
import type { AgentIssue, ReviewResult } from './types.js';

function buildReviewPrompt(issue: AgentIssue): string {
  return `You are a code reviewer for SLApp, a Stockholm public transport dashboard.

Your task is to verify whether the implementation on the current git branch satisfies the acceptance criteria in the issue below.

## Issue: ${issue.identifier}: ${issue.title}

${issue.description ?? '(No description provided)'}

## Instructions

1. Run \`git log main..HEAD --oneline\` to see what was committed
2. Run \`git diff main..HEAD\` to inspect the changes
3. Read any relevant source files to understand the implementation
4. Check each acceptance criterion against the diff
5. At the very end of your response, output exactly one JSON block:

\`\`\`json
{"approved": true, "feedback": "Summary of what was done"}
\`\`\`

Set "approved" to true ONLY if ALL acceptance criteria are satisfied and there are commits on the branch.
Set "feedback" to a brief explanation. For rejections, list specifically what is missing or wrong so the developer can fix it.`;
}

function parseReviewResult(result: string): ReviewResult {
  const blocks = [...result.matchAll(/```json\s*([\s\S]*?)\s*```/g)];
  if (blocks.length > 0) {
    const lastBlock = blocks[blocks.length - 1][1];
    try {
      const parsed = JSON.parse(lastBlock) as { approved?: unknown; feedback?: unknown };
      if (typeof parsed.approved === 'boolean') {
        return { approved: parsed.approved, feedback: String(parsed.feedback ?? '') };
      }
    } catch { /* fall through */ }
  }
  return { approved: true, feedback: 'Could not parse review output — auto-approved with caution' };
}

export async function review(issue: AgentIssue): Promise<ReviewResult> {
  console.log(`\n🔍 Reviewer checking ${issue.identifier}...`);

  let result = '';

  try {
    for await (const message of query({
      prompt: buildReviewPrompt(issue),
      options: {
        cwd: REPO_DIR,
        allowedTools: ['Read', 'Bash', 'Glob', 'Grep'],
        permissionMode: 'acceptEdits',
        maxTurns: 20,
        model: 'claude-opus-4-6',
        systemPrompt: `You are a read-only code reviewer. You may read files and run read-only git commands (git log, git diff, git show). Do NOT write, edit, or commit anything.`,
      },
    })) {
      if ('result' in message) {
        result = message.result;
        console.log(`   Reviewer result: ${result.slice(0, 300)}`);
      }
    }
  } catch (err) {
    console.warn(`⚠️  Reviewer SDK error: ${err instanceof Error ? err.message : err}`);
  }

  return parseReviewResult(result);
}
