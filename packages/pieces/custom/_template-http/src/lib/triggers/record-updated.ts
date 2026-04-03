import {
  DedupeStrategy,
  Polling,
  pollingHelper,
} from '@activepieces/pieces-common';
import { createTrigger, TriggerStrategy } from '@activepieces/pieces-framework';
import { templateHttpAuth } from '../..';
import { listResources } from '../common/client';
import { Resource } from '../common/types';
import { props } from '../common/props';

// ── Polling definition — lives OUTSIDE the trigger so it can be typed cleanly ──

type AuthValue = string;
type PropsValue = { project_id: string };

const polling: Polling<AuthValue, PropsValue> = {
  strategy: DedupeStrategy.TIMEBASED,
  // items() is called on every poll cycle. Return all records updated since
  // the last poll. The framework deduplicates using epochMilliSeconds.
  items: async ({ auth, propsValue, lastFetchEpochMS }) => {
    const resources = await listResources(auth, propsValue.project_id, lastFetchEpochMS);
    return resources.map((r: Resource) => ({
      epochMilliSeconds: new Date(r.updated_at).getTime(),
      data: r,
    }));
  },
};

// ── Trigger definition ────────────────────────────────────────────────────────

export const recordUpdatedTrigger = createTrigger({
  auth: templateHttpAuth,
  name: 'record_updated',
  displayName: 'Record Updated',
  description: 'Fires on a schedule and returns resources updated since the last check.',
  type: TriggerStrategy.POLLING,

  props: {
    project_id: props.project_id(),
  },

  sampleData: {
    id: 'res_abc123',
    title: 'Updated Resource',
    description: 'This resource was recently changed',
    status: 'inactive',
    assignee_id: 'usr_xyz789',
    project_id: 'proj_def456',
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-15T14:22:00Z',
  },

  // pollingHelper handles store reads/writes for deduplication automatically.
  async test(ctx) {
    return pollingHelper.test(polling, {
      auth: ctx.auth as string,
      store: ctx.store,
      propsValue: ctx.propsValue,
      files: ctx.files,
    });
  },

  async onEnable(ctx) {
    await pollingHelper.onEnable(polling, {
      auth: ctx.auth as string,
      store: ctx.store,
      propsValue: ctx.propsValue,
    });
  },

  async onDisable(ctx) {
    await pollingHelper.onDisable(polling, {
      auth: ctx.auth as string,
      store: ctx.store,
      propsValue: ctx.propsValue,
    });
  },

  async run(ctx) {
    return pollingHelper.poll(polling, {
      auth: ctx.auth as string,
      store: ctx.store,
      propsValue: ctx.propsValue,
      files: ctx.files,
    });
  },
});
