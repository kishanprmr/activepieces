import {
  disabledDropdown,
  DynamicPropsValue,
  Property,
} from '@activepieces/pieces-framework';
import { tryCatch } from '@activepieces/shared';
import { templateHttpAuth } from '../auth';
import { listCustomFields, listProjects, listUsers } from './client';

// ─────────────────────────────────────────────────────────────────────────────
// Rules:
//  - Only put props here if they are reused in 2+ actions/triggers.
//  - Scalar props (ShortText, Number, Checkbox, etc.) stay inline in the action.
//  - Every factory signature is (required = default) OR an options object.
//  - Never call httpClient directly — always use client.ts functions.
//  - Never throw in options callbacks — return disabledDropdown() on error.
// ─────────────────────────────────────────────────────────────────────────────

export const props = {

  // ── 1. API-fetched single-select dropdown ─────────────────────────────────
  // Naming: <noun>_id for ID values.
  // refreshers: list any props that should re-trigger this dropdown.
  user_id: (required = true) =>
    Property.Dropdown({
      auth: templateHttpAuth,
      displayName: 'User',
      required,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) return disabledDropdown('Connect your account first');

        const { data: users, error } = await tryCatch(() => listUsers(auth as string));
        if (error) return disabledDropdown('Failed to load users — check your connection');

        return {
          disabled: false,
          options: users.map((u) => ({ label: u.name, value: u.id })),
        };
      },
    }),

  // ── 2. Dependent dropdown — re-fetches when a parent prop changes ─────────
  // workspace_id must exist in the same action's props for refreshers to work.
  project_id: (required = true) =>
    Property.Dropdown({
      auth: templateHttpAuth,
      displayName: 'Project',
      required,
      refreshers: ['auth', 'workspace_id'],
      options: async ({ auth, workspace_id }) => {
        if (!auth || !workspace_id) return disabledDropdown('Select a workspace first');

        const { data: projects, error } = await tryCatch(() =>
          listProjects(auth as string, workspace_id as string)
        );
        if (error) return disabledDropdown('Failed to load projects — check your connection');

        return {
          disabled: false,
          options: projects.map((p) => ({ label: p.name, value: p.id })),
        };
      },
    }),

  // ── 3. Multi-select dropdown ──────────────────────────────────────────────
  // Use Property.MultiSelectDropdown when users can pick multiple values.
  user_ids: (required = false) =>
    Property.MultiSelectDropdown({
      auth: templateHttpAuth,
      displayName: 'Users',
      required,
      refreshers: ['auth'],
      options: async ({ auth }) => {
        if (!auth) return disabledDropdown('Connect your account first');

        const { data: users, error } = await tryCatch(() => listUsers(auth as string));
        if (error) return disabledDropdown('Failed to load users — check your connection');

        return {
          disabled: false,
          options: users.map((u) => ({ label: u.name, value: u.id })),
        };
      },
    }),

  // ── 4. Static dropdown — hardcoded options, no API call ──────────────────
  // Use StaticDropdown when the options are fixed and known at build time.
  // Only put in props.ts if 2+ actions share this exact same prop.
  status: (required = false) =>
    Property.StaticDropdown({
      displayName: 'Status',
      required,
      options: {
        disabled: false,
        options: [
          { label: 'Active',   value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Archived', value: 'archived' },
        ],
      },
    }),

  // ── 5. Static multi-select ────────────────────────────────────────────────
  event_types: (required = false) =>
    Property.StaticMultiSelectDropdown({
      displayName: 'Event Types',
      required,
      options: {
        disabled: false,
        options: [
          { label: 'Created', value: 'created' },
          { label: 'Updated', value: 'updated' },
          { label: 'Deleted', value: 'deleted' },
        ],
      },
    }),

  // ── 6. Dynamic properties — schema fetched from the API ──────────────────
  // Used when the API has user-defined custom fields (CRMs, databases, etc.).
  // The prop key in the action should always be named `custom_fields`.
  // objectType: which resource type's fields to fetch (e.g. 'resource', 'contact').
  custom_fields: (objectType: string, options: { required?: boolean } = {}) =>
    Property.DynamicProperties({
      auth: templateHttpAuth,
      displayName: 'Custom Fields',
      required: options.required ?? false,
      refreshers: ['auth'],
      props: async ({ auth }) => {
        if (!auth) return {};

        const { data: fieldDefs, error } = await tryCatch(() =>
          listCustomFields(auth as string, objectType)
        );
        if (error) return {};

        const fields: DynamicPropsValue = {};

        for (const field of fieldDefs) {
          if (field.type === 'text') {
            fields[field.id] = Property.ShortText({ displayName: field.name, required: false });
          } else if (field.type === 'number') {
            fields[field.id] = Property.Number({ displayName: field.name, required: false });
          } else if (field.type === 'select' && field.choices) {
            fields[field.id] = Property.StaticDropdown({
              displayName: field.name,
              required: false,
              options: {
                disabled: false,
                options: field.choices.map((c) => ({ label: c, value: c })),
              },
            });
          }
          // Skip unsupported field types — never throw
        }

        return fields;
      },
    }),
};
