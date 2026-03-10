import { LinearClient } from '@linear/sdk';
import type { AgentIssue } from './types.js';

const DEV_AGENT_LABEL = 'dev-agent';

export function createLinearClient(): LinearClient {
  const apiKey = process.env.LINEAR_ACCESS_TOKEN;
  if (!apiKey) throw new Error('LINEAR_ACCESS_TOKEN environment variable is required');
  return new LinearClient({ apiKey });
}

export async function findAgentIssues(linear: LinearClient): Promise<AgentIssue[]> {
  const issues = await linear.issues({
    filter: {
      labels: { name: { eq: DEV_AGENT_LABEL } },
      state: { name: { eq: 'Todo' } },
    },
  });

  return Promise.all(
    issues.nodes.map(async (issue) => ({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description ?? null,
      url: issue.url,
      teamId: (await issue.team)?.id ?? '',
    }))
  );
}

export async function markInProgress(linear: LinearClient, issueId: string): Promise<void> {
  const issue = await linear.issue(issueId);
  const team = await issue.team;
  if (!team) return;

  const states = await linear.workflowStates({ filter: { team: { id: { eq: team.id } } } });
  const inProgress = states.nodes.find((s) => s.name === 'In Progress');
  if (!inProgress) return;

  await linear.updateIssue(issueId, { stateId: inProgress.id });
}

export async function addComment(linear: LinearClient, issueId: string, body: string): Promise<void> {
  await linear.createComment({ issueId, body });
}

export async function removeLabelAndSetReview(
  linear: LinearClient,
  issueId: string,
): Promise<void> {
  const issue = await linear.issue(issueId);
  const team = await issue.team;
  if (!team) return;

  const states = await linear.workflowStates({ filter: { team: { id: { eq: team.id } } } });
  const inReview = states.nodes.find((s) => s.name === 'In Review');
  if (inReview) {
    await linear.updateIssue(issueId, { stateId: inReview.id });
  }
}
