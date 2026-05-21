import { createLinearClient, findAgentIssues, markInProgress, setTodo, addComment, setInReview } from './linear.js';
import { orchestrate } from './orchestrator.js';
import { notify } from './slack.js';

const POLL_INTERVAL_MS = 60_000;

async function processIssue(issue: { id: string; identifier: string; title: string; description: string | null; url: string; teamId: string }) {
  const linear = createLinearClient();

  console.log(`\n📋 Processing: ${issue.identifier} — ${issue.title}`);
  await notify(`🤖 *Dev agent picking up ${issue.identifier}*\n${issue.title}\n${issue.url}`);
  await markInProgress(linear, issue.id);

  try {
    const result = await orchestrate(issue);

    switch (result.type) {
      case 'skipped':
        await addComment(linear, issue.id, `🤖 Dev agent skipped — needs human:\n${result.reason}`);
        await setTodo(linear, issue.id);
        await notify(`⏭️ *Dev agent skipped ${issue.identifier}* — ${result.reason}`);
        break;

      case 'completed':
        await addComment(linear, issue.id, `🤖 Dev agent created PR: ${result.prUrl}`);
        await setInReview(linear, issue.id);
        await notify(`✅ *Dev agent completed ${issue.identifier}*\n${issue.title}\nPR: ${result.prUrl}`);
        break;

      case 'failed':
        await addComment(linear, issue.id, `❌ Dev agent failed:\n\`\`\`\n${result.error}\n\`\`\``);
        await notify(`❌ *Dev agent failed on ${issue.identifier}*\n\`${result.error.slice(0, 200)}\``);
        break;
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Failed on ${issue.identifier}:`, errorMessage);
    try {
      await addComment(linear, issue.id, `❌ Dev agent failed:\n\`\`\`\n${errorMessage}\n\`\`\``);
    } catch (commentErr) {
      console.error('Failed to post Linear comment:', commentErr);
    }
    try {
      await notify(`❌ *Dev agent failed on ${issue.identifier}*\n\`${errorMessage.slice(0, 200)}\``);
    } catch (notifyErr) {
      console.error('Failed to send Slack notification:', notifyErr);
    }
  }
}

async function poll() {
  const linear = createLinearClient();

  console.log('🔍 Checking Linear for issues assigned to agent in Todo state...');

  const issues = await findAgentIssues(linear);

  if (issues.length === 0) {
    console.log('   No issues found.');
    return;
  }

  console.log(`   Found ${issues.length} issue(s).`);

  // Process one at a time to avoid git conflicts
  for (const issue of issues) {
    await processIssue(issue);
  }
}

async function main() {
  console.log('🚀 SLApp dev agent started');
  console.log(`   Polling every ${POLL_INTERVAL_MS / 1000}s\n`);

  await poll();

  setInterval(async () => {
    try {
      await poll();
    } catch (err) {
      console.error('Poll error:', err);
    }
  }, POLL_INTERVAL_MS);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
