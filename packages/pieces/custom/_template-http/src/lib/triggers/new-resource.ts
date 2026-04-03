import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { templateHttpAuth } from '../..';
import { deleteWebhook, registerWebhook } from '../common/client';
import { props } from '../common/props';

// Shape of what we persist in the store so we can clean up on disable.
type StoredWebhook = {
  webhookId: string;
};

const STORE_KEY = '_new_resource_webhook_id';

export const newResourceTrigger = createTrigger({
  auth: templateHttpAuth,
  name: 'new_resource',
  displayName: 'New Resource',
  description: 'Fires when a new resource is created in Example App.',
  type: TriggerStrategy.WEBHOOK,

  props: {
    project_id: props.project_id(),
    event_types: props.event_types(),
  },

  // Realistic sample matching the actual webhook payload shape.
  sampleData: {
    event: 'resource.created',
    data: {
      id: 'res_abc123',
      title: 'Sample Resource',
      description: 'A sample resource created by a webhook',
      status: 'active',
      assignee_id: 'usr_xyz789',
      project_id: 'proj_def456',
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    },
  },

  // Called once when the flow is enabled. Register the webhook and persist its ID.
  async onEnable(ctx) {
    const webhook = await registerWebhook(
      ctx.auth as string,
      ctx.webhookUrl,
      ['resource.created']
    );
    await ctx.store?.put<StoredWebhook>(STORE_KEY, { webhookId: webhook.id });
  },

  // Called when the flow is disabled or deleted. Always clean up remote webhooks.
  async onDisable(ctx) {
    const stored = await ctx.store?.get<StoredWebhook>(STORE_KEY);
    if (stored?.webhookId) {
      await deleteWebhook(ctx.auth as string, stored.webhookId);
    }
  },

  // Called for every incoming webhook request. Return an array of payloads to process.
  // Return [] to ignore the event (e.g. wrong event type).
  async run(ctx) {
    const body = ctx.payload.body as { event: string; data: unknown };
    if (body.event === 'resource.created') {
      return [body.data];
    }
    return [];
  },
});
