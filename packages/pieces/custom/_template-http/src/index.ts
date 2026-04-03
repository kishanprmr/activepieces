import { createCustomApiCallAction } from '@activepieces/pieces-common';
import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createResourceAction } from './lib/actions/create-resource';
import { newResourceTrigger } from './lib/triggers/new-resource';
import { recordUpdatedTrigger } from './lib/triggers/record-updated';

const markdown = `
To get your API key:

1. Log in to Example App
2. Go to **Settings → API Keys**
3. Click **Create new key** and copy the value.`;

export const templateHttpAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  required: true,
  description: markdown,
  validate: async ({ auth }) => {
    // Auth validation is in auth.ts — re-exported here for convenience.
    // Replace this with an actual API call if validation logic is simple.
    if (!auth || auth.length < 10) {
      return { valid: false, error: 'API key looks too short — check your credentials.' };
    }
    return { valid: true };
  },
});

export const templateHttpPiece = createPiece({
  displayName: 'Template (HTTP)',
  description: 'Copy this template when building a piece that calls a REST API directly.',

  auth: templateHttpAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/custom.png',
  authors: ['your-github-username'],
  categories: [PieceCategory.DEVELOPER_TOOLS],

  actions: [
    createResourceAction,
    // Add a free-form "Custom API Call" action for power users.
    createCustomApiCallAction({
      auth: templateHttpAuth,
      baseUrl: () => 'https://api.example.com/v1',
      authMapping: async (auth) => ({
        Authorization: `Bearer ${auth as string}`,
      }),
    }),
  ],

  triggers: [
    newResourceTrigger,
    recordUpdatedTrigger,
  ],
});
