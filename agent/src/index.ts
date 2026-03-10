import { createLinearClient, findAgentIssues, markInProgress, addComment, setInReview } from './linear.js';
import { developIssue } from './developer.js';
import { notify } from './slack.js';

const POLL_INTERVAL_MS = 60_000; // 1 minute

async function processIssue(issue: { id: string; identifier: string; title: string; description: string | null; url: string; teamId: string }) {
  const linear = createLinearClient();

  console.log(`\n📋 Processing: ${issue.identifier} — ${issue.title}`);

  await notify(`🤖 *Dev agent picking up ${issue.identifier}*\n${issue.title}\n${issue.url}`);
  await markInProgress(linear, issue.id);

  try {
    const prUrl = await developIssue(issue);

    await addComment(linear, issue.id, `🤖 Dev agent created PR: ${prUrl}`);
    await setInReview(linear, issue.id);
    await notify(`✅ *Dev agent completed ${issue.identifier}*\n${issue.title}\nPR: ${prUrl}`);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Failed on ${issue.identifier}:`, errorMessage);
    await addComment(linear, issue.id, `❌ Dev agent failed:\n\`\`\`\n${errorMessage}\n\`\`\``);
    await notify(`❌ *Dev agent failed on ${issue.identifier}*\n${issue.title}\n\`${errorMessage.slice(0, 200)}\``);
  }
}

async function poll() {
  const linear = createLinearClient();

  console.log('🔍 Checking Linear for issues labeled "dev-agent" in Todo state...');

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
  console.log(`   Polling every ${POLL_INTERVAL_MS / 1000}s for issues labeled "dev-agent"\n`);

  // Run immediately on start, then on interval
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
