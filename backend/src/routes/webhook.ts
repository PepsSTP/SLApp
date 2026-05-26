import { Router, Request, Response } from 'express';
import express from 'express';
import crypto from 'crypto';

const router = Router();

router.post(
  '/linear',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const secret = process.env.LINEAR_WEBHOOK_SECRET;
    if (!secret) {
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    const signature = req.headers['linear-signature'] as string | undefined;
    if (!signature) {
      res.status(401).json({ error: 'Missing signature' });
      return;
    }

    const rawBody = req.body as Buffer;
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    try {
      if (!crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }
    } catch {
      res.status(401).json({ error: 'Invalid signature format' });
      return;
    }

    const payload = JSON.parse(rawBody.toString()) as {
      type: string;
      action: string;
      data: { id: string; assignee?: { name: string } };
    };

    // Only trigger when an issue is assigned to the agent
    if (payload.type !== 'Issue') {
      res.status(200).json({ ignored: true });
      return;
    }

    if (payload.data?.assignee?.name !== 'Claude Agent') {
      res.status(200).json({ ignored: true });
      return;
    }

    const triggerToken = process.env.AGENT_TRIGGER_TOKEN;
    if (!triggerToken) {
      res.status(500).json({ error: 'Agent trigger token not configured' });
      return;
    }

    const response = await fetch('https://api.github.com/repos/PepsSTP/SLApp/dispatches', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${triggerToken}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event_type: 'linear-agent-issue' }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Failed to trigger agent workflow: ${response.status} ${text}`);
      res.status(500).json({ error: 'Failed to trigger workflow' });
      return;
    }

    res.status(200).json({ triggered: true });
  }
);

export default router;
