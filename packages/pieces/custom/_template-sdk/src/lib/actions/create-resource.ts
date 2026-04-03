import { createAction, Property } from '@activepieces/pieces-framework';
import { templateSdkAuth } from '../..';
import { makeClient } from '../common/client';
import { props } from '../common/props';

export const createResourceAction = createAction({
  auth: templateSdkAuth,
  name: 'create_resource',
  displayName: 'Create Resource',
  description: 'Creates a new resource using the SDK.',
  props: {
    // ── Inline scalar props first ────────────────────────────────────────────
    title: Property.ShortText({
      displayName: 'Title',
      required: true,
    }),
    description: Property.LongText({
      displayName: 'Description',
      required: false,
    }),

    // ── Reused dropdown props — team_id before resource_id (dependency) ─────
    team_id: props.team_id(),
    user_ids: props.user_ids(false),
    status: props.status(),

    // ── Options-object variant — show "Source Team" label in a copy action ───
    // Uncomment when you need the same dropdown with a different display name:
    // source_team_id: props.team_id_labeled({ displayName: 'Source Team', required: true }),
    // target_team_id: props.team_id_labeled({ displayName: 'Target Team', required: true }),
  },

  async run({ auth, propsValue }) {
    // SDK instance is created here — not shared between actions.
    const client = makeClient(auth);

    const result = await client.resources.create({
      title:       propsValue.title,
      description: propsValue.description ?? undefined,
      teamId:      propsValue.team_id,
      assigneeId:  propsValue.user_ids?.[0] ?? undefined,
    });

    return result;
  },
});
