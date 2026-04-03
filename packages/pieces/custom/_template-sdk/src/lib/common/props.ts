import { disabledDropdown, DropdownOption, Property } from '@activepieces/pieces-framework';
import { tryCatch } from '@activepieces/shared';
import { templateSdkAuth } from '../..';
import { makeClient } from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Props for the SDK-based template.
//
// Pattern: call makeClient(auth).someMethod() inside options callbacks.
// For cursor-based pagination (common in GraphQL SDKs), loop until
// pageInfo.hasNextPage is false.
// ─────────────────────────────────────────────────────────────────────────────

export const props = {

  // ── 1. Single-select dropdown — cursor paginated ──────────────────────────
  team_id: (required = true) =>
    Property.Dropdown({
      auth: templateSdkAuth,
      displayName: 'Team',
      required,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) return disabledDropdown('Connect your account first');

        const client = makeClient(auth);
        const options: DropdownOption<string>[] = [];
        let cursor: string | undefined;
        let hasNextPage = false;

        do {
          const { data: page, error } = await tryCatch(() =>
            client.teams.list({ first: 100, after: cursor })
          );
          if (error) return disabledDropdown('Failed to load teams — check your connection');

          for (const team of page.nodes) {
            options.push({ label: team.name, value: team.id });
          }

          hasNextPage = page.pageInfo.hasNextPage;
          cursor = page.pageInfo.endCursor;
        } while (hasNextPage);

        return { disabled: false, options };
      },
    }),

  // ── 2. Dependent dropdown — re-fetches when team_id changes ──────────────
  // team_id must be in the same action's props for the refresher to fire.
  resource_id: (required = true) =>
    Property.Dropdown({
      auth: templateSdkAuth,
      displayName: 'Resource',
      required,
      refreshers: ['auth', 'team_id'],
      options: async ({ auth, team_id }) => {
        if (!auth || !team_id) return disabledDropdown('Select a team first');

        const client = makeClient(auth);
        const options: DropdownOption<string>[] = [];
        let cursor: string | undefined;
        let hasNextPage = false;

        do {
          const { data: page, error } = await tryCatch(() =>
            client.resources.list({ first: 50, after: cursor, teamId: team_id as string })
          );
          if (error) return disabledDropdown('Failed to load resources — check your connection');

          for (const resource of page.nodes) {
            options.push({ label: resource.title, value: resource.id });
          }

          hasNextPage = page.pageInfo.hasNextPage;
          cursor = page.pageInfo.endCursor;
        } while (hasNextPage);

        return { disabled: false, options };
      },
    }),

  // ── 3. Multi-select dropdown ──────────────────────────────────────────────
  user_ids: (required = false) =>
    Property.MultiSelectDropdown({
      auth: templateSdkAuth,
      displayName: 'Assignees',
      required,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) return disabledDropdown('Connect your account first');

        const client = makeClient(auth);
        const options: DropdownOption<string>[] = [];
        let cursor: string | undefined;
        let hasNextPage = false;

        do {
          const { data: page, error } = await tryCatch(() =>
            client.users.list({ first: 100, after: cursor })
          );
          if (error) return disabledDropdown('Failed to load users — check your connection');

          for (const user of page.nodes) {
            options.push({ label: user.name, value: user.id });
          }

          hasNextPage = page.pageInfo.hasNextPage;
          cursor = page.pageInfo.endCursor;
        } while (hasNextPage);

        return { disabled: false, options };
      },
    }),

  // ── 4. Static dropdown — same pattern as HTTP template ───────────────────
  status: (required = false) =>
    Property.StaticDropdown({
      displayName: 'Status',
      required,
      options: {
        disabled: false,
        options: [
          { label: 'Backlog',     value: 'backlog' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Done',        value: 'done' },
          { label: 'Cancelled',   value: 'cancelled' },
        ],
      },
    }),

  // ── 5. Static multi-select ────────────────────────────────────────────────
  priority: (required = false) =>
    Property.StaticMultiSelectDropdown({
      displayName: 'Priority',
      required,
      options: {
        disabled: false,
        options: [
          { label: 'Urgent', value: 'urgent' },
          { label: 'High',   value: 'high' },
          { label: 'Medium', value: 'medium' },
          { label: 'Low',    value: 'low' },
        ],
      },
    }),

  // ── 6. Options-object signature — when displayName also varies ────────────
  // Use an options object (not extra positional params) when more than
  // `required` needs to change at the call site.
  team_id_labeled: (options: { required?: boolean; displayName?: string; description?: string } = {}) =>
    Property.Dropdown({
      auth: templateSdkAuth,
      displayName: options.displayName ?? 'Team',
      description: options.description,
      required: options.required ?? true,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) return disabledDropdown('Connect your account first');

        const client = makeClient(auth);
        const opts: DropdownOption<string>[] = [];
        let cursor: string | undefined;
        let hasNextPage = false;

        do {
          const { data: page, error } = await tryCatch(() =>
            client.teams.list({ first: 100, after: cursor })
          );
          if (error) return disabledDropdown('Failed to load teams — check your connection');

          for (const team of page.nodes) {
            opts.push({ label: team.name, value: team.id });
          }

          hasNextPage = page.pageInfo.hasNextPage;
          cursor = page.pageInfo.endCursor;
        } while (hasNextPage);

        return { disabled: false, options: opts };
      },
    }),
};
