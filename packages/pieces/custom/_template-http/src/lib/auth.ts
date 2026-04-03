import { HttpError, httpClient, HttpMethod } from '@activepieces/pieces-common';
import { PieceAuth } from '@activepieces/pieces-framework';
import { tryCatch } from '@activepieces/shared';

const markdown = `
To get your API key:

1. Log in to Example App
2. Go to **Settings → API Keys**
3. Click **Create new key**, give it a name, and copy the value.`;

export const templateHttpAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  required: true,
  description: markdown,
  validate: async ({ auth }) => {
    const { error } = await tryCatch(() =>
      httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://api.example.com/v1/me',
        headers: { Authorization: `Bearer ${auth}` },
      })
    );

    if (error) {
      const status = error instanceof HttpError ? error.response.status : 0;
      const msg =
        status === 401
          ? 'Invalid API key — check your credentials.'
          : `Connection failed (${status || 'network error'}).`;
      return { valid: false, error: msg };
    }

    return { valid: true };
  },
});
