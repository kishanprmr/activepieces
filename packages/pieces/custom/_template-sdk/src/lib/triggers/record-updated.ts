import {
  DedupeStrategy,
  Polling,
  pollingHelper,
} from '@activepieces/pieces-common';
import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { templateSdkAuth } from '../..';
import { makeClient } from '../common/client';
import { SdkResource } from '../common/types';
import { props } from '../common/props';

// ── Polling definition — typed and defined outside the trigger ────────────────
// AppConnectionValueForAuthProperty is the inferred auth type after connection.
// Using `unknown` here to avoid the circular dependency — cast inside items().

const polling: Polling<unknown, { team_id: string }> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth, propsValue, lastFetchEpochMS }) => {
    const client = makeClient(auth as Parameters<typeof makeClient>[0]);
    // Filter by updatedAt if the SDK supports it; otherwise fetch all and filter.
    const page = await client.resources.list({
      first: 100,
      teamId: propsValue.team_id,
      updatedAfter: new Date(lastFetchEpochMS).toISOString(),
    });

    return page.nodes.map((r: SdkResource) => ({
      epochMilliSeconds: new Date(r.updatedAt).getTime(),
      data: r,
    }));
  },
};

// ── Trigger definition ────────────────────────────────────────────────────────

export const recordUpdatedTrigger = createTrigger({
  auth: templateSdkAuth,
  name: 'record_updated',
  displayName: 'Record Updated',
  description: 'Polls on a schedule and returns resources updated since the last check.',
  type: TriggerStrategy.POLLING,

  props: {
    team_id: props.team_id(),
  },

  sampleData: {
    id: 'res_abc123',
    title: 'Updated Resource',
    description: 'This resource was recently changed',
    status: 'in_progress',
    teamId: 'team_def456',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T14:22:00Z',
  },

  async test(ctx) {
    return pollingHelper.test(polling, {
      auth: ctx.auth,
      store: ctx.store,
      propsValue: ctx.propsValue,
      files: ctx.files,
    });
  },

  async onEnable(ctx) {
    await pollingHelper.onEnable(polling, {
      auth: ctx.auth,
      store: ctx.store,
      propsValue: ctx.propsValue,
    });
  },

  async onDisable(ctx) {
    await pollingHelper.onDisable(polling, {
      auth: ctx.auth,
      store: ctx.store,
      propsValue: ctx.propsValue,
    });
  },

  async run(ctx) {
    return pollingHelper.poll(polling, {
      auth: ctx.auth,
      store: ctx.store,
      propsValue: ctx.propsValue,
      files: ctx.files,
    });
  },
});
