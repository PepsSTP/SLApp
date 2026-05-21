export interface AgentIssue {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  url: string;
  teamId: string;
}

export interface ReviewResult {
  approved: boolean;
  feedback: string;
}
