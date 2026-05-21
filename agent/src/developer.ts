import { query } from '@anthropic-ai/claude-agent-sdk';
import { exec, REPO_DIR } from './utils.js';
import type { AgentIssue } from './types.js';

function buildPrompt(issue: AgentIssue, previousFeedback?: string): string {
  let prompt = `You are working on SLApp. Your task is to implement the following Linear issue:

**${issue.identifier}: ${issue.title}**

${issue.description ?? '(No description provided)'}

---

Instructions:
1. Read SPEC.md and README.md first to understand the project
2. Implement the changes described in the issue
3. Make sure both frontend and backend lint and tests pass by running:
   - \`cd backend && npm run lint && npm test\`
   - \`cd frontend && npm run lint && npm test\`
4. Fix any lint errors or test failures before finishing
5. Keep changes focused — only implement what the issue describes
6. Commit your changes with \`git add\` and \`git commit\`. Do NOT push or create a PR.

The issue URL for reference: ${issue.url}`;

  if (previousFeedback) {
    prompt += `\n\n---\n\n**A reviewer rejected your previous implementation. Fix these issues before committing:**\n\n${previousFeedback}`;
  }

  return prompt;
}

export async function implement(issue: AgentIssue, previousFeedback?: string): Promise<void> {
  console.log(`\n🤖 Developer implementing ${issue.identifier}: ${issue.title}`);
  if (previousFeedback) console.log('   (incorporating reviewer feedback)');

  let queryError: unknown = null;

  try {
    for await (const message of query({
      prompt: buildPrompt(issue, previousFeedback),
      options: {
        cwd: REPO_DIR,
        allowedTools: ['Read', 'Write', 'Edit', 'Bash', 'Glob', 'Grep'],
        permissionMode: 'acceptEdits',
        maxTurns: 80,
        model: 'claude-opus-4-6',
        systemPrompt: `You are a TypeScript developer working on SLApp, a Stockholm public transport dashboard.
The project has a React/Vite frontend and an Express backend, both in TypeScript.
Always read existing code before modifying it. Follow the existing code style.
Run tests after implementing changes and fix any failures.
Make clean, focused commits with descriptive messages.
IMPORTANT: Do NOT push to remote or create a pull request. Only implement, commit, and stop.`,
      },
    })) {
      if ('result' in message) {
        console.log(`\n✅ Developer finished: ${message.result.slice(0, 200)}`);
      }
    }
  } catch (err) {
    queryError = err;
    console.warn(`\n⚠️  Developer SDK error: ${err instanceof Error ? err.message : err}`);
  }

  const newCommits = exec('git log main..HEAD --oneline');
  if (!newCommits) {
    throw queryError ?? new Error('Developer produced no commits');
  }

  console.log(`\n📦 Developer commits:\n${newCommits}`);
}
