import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { templateSdkAuth } from '../..';
import { makeClient } from '../common/client';
import { props } from '../common/props';
import { StoredWebhook } from '../common/types';

const STORE_KEY = '_new_resource_webhook_id';

export const newResourceTrigger = createTrigger({
  auth: templateSdkAuth,
  name: 'new_resource',
  displayName: 'New Resource',
  description: 'Fires when a new resource is created.',
  type: TriggerStrategy.WEBHOOK,

  props: {
    team_id: props.team_id(),
  },

  sampleData: {
    action: 'create',
    data: {
      id: 'res_abc123',
      title: 'Sample Resource',
      description: 'A sample resource',
      status: 'backlog',
      teamId: 'team_def456',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
  },

  async onEnable(ctx) {
    const client = makeClient(ctx.auth);
    const webhook = await client.webhooks.create({
      label: 'Activepieces New Resource',
      url: ctx.webhookUrl,
      teamId: ctx.propsValue.team_id,
      resourceTypes: ['Resource'],
    });
    await ctx.store?.put<StoredWebhook>(STORE_KEY, { webhookId: webhook.id });
  },

  async onDisable(ctx) {
    const stored = await ctx.store?.get<StoredWebhook>(STORE_KEY);
    if (stored?.webhookId) {
      const client = makeClient(ctx.auth);
      await client.webhooks.delete(stored.webhookId);
    }
  },

  async run(ctx) {
    const body = ctx.payload.body as { action: string; data: unknown };
    if (body.action === 'create') {
      return [body.data];
    }
    return [];
  },
});
