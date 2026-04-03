import { createAction, Property } from '@activepieces/pieces-framework';
import { templateHttpAuth } from '../..';
import { createResource } from '../common/client';
import { props } from '../common/props';

export const createResourceAction = createAction({
  auth: templateHttpAuth,
  name: 'create_resource',
  displayName: 'Create Resource',
  description: 'Creates a new resource in Example App.',
  props: {
    // ── Inline scalar props first (not shared — defined here only) ──────────
    title: Property.ShortText({
      displayName: 'Title',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      required: false,
    }),
    due_date: Property.DateTime({
      displayName: 'Due Date',
      required: false,
    }),
    quantity: Property.Number({
      displayName: 'Quantity',
      required: false,
      defaultValue: 1,
    }),
    is_active: Property.Checkbox({
      displayName: 'Active',
      required: false,
      defaultValue: true,
    }),
    metadata: Property.Json({
      displayName: 'Extra Metadata',
      required: false,
    }),
    attachment: Property.File({
      displayName: 'Attachment',
      required: false,
    }),

    // ── Reused dropdown props from props.ts (shared across actions) ─────────
    // workspace_id must appear BEFORE project_id because project_id depends on it.
    workspace_id: Property.ShortText({
      displayName: 'Workspace ID',
      description: 'The workspace to create the resource in.',
      required: true,
    }),
    project_id: props.project_id(),       // dependent on workspace_id above
    user_id: props.user_id(false),        // pass false to make optional
    user_ids: props.user_ids(),
    status: props.status(),

    // ── Dynamic fields (schema comes from the API) — always last ─────────────
    custom_fields: props.custom_fields('resource'),
  },

  async run({ auth, propsValue }) {
    const result = await createResource(auth as string, {
      title:       propsValue.title,
      description: propsValue.description ?? undefined,
      assignee_id: propsValue.user_id ?? undefined,
      project_id:  propsValue.project_id,
      status:      propsValue.status ?? undefined,
      // Spread custom_fields at the end — API accepts them at the top level
      ...propsValue.custom_fields,
    });

    return result;
  },
});
