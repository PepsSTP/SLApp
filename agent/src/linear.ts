import { LinearClient } from '@linear/sdk';
import type { AgentIssue } from './types.js';

export function createLinearClient(): LinearClient {
  const apiKey = process.env.LINEAR_ACCESS_TOKEN;
  if (!apiKey) throw new Error('LINEAR_ACCESS_TOKEN environment variable is required');
  return new LinearClient({ apiKey });
}

export async function resolveAgentUserId(linear: LinearClient): Promise<string> {
  const agentUserName = process.env.LINEAR_AGENT_USER ?? 'Claude Agent';
  const users = await linear.users();
  const agentUser = users.nodes.find((u) => u.name === agentUserName);
  if (!agentUser) {
    throw new Error(
      `Linear user "${agentUserName}" not found. Create the user in Linear or set LINEAR_AGENT_USER to the correct name.`
    );
  }
  return agentUser.id;
}

export async function findAgentIssues(linear: LinearClient): Promise<AgentIssue[]> {
  const assigneeId = await resolveAgentUserId(linear);

  const issues = await linear.issues({
    filter: {
      assignee: { id: { eq: assigneeId } },
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

export async function setInReview(linear: LinearClient, issueId: string): Promise<void> {
  const issue = await linear.issue(issueId);
  const team = await issue.team;
  if (!team) return;

  const states = await linear.workflowStates({ filter: { team: { id: { eq: team.id } } } });
  const inReview = states.nodes.find((s) => s.name === 'In Review');
  if (inReview) {
    await linear.updateIssue(issueId, { stateId: inReview.id });
  }
}

export async function setTodo(linear: LinearClient, issueId: string): Promise<void> {
  const issue = await linear.issue(issueId);
  const team = await issue.team;
  if (!team) return;

  const states = await linear.workflowStates({ filter: { team: { id: { eq: team.id } } } });
  const todo = states.nodes.find((s) => s.name === 'Todo');
  if (todo) {
    await linear.updateIssue(issueId, { stateId: todo.id });
  }
}
