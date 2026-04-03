import { PieceAuth } from '@activepieces/pieces-framework';

// ─────────────────────────────────────────────────────────────────────────────
// OAuth2 auth example (most SDKs use OAuth2 or API key).
// Switch to PieceAuth.SecretText for API key auth — see _template-http.
// ─────────────────────────────────────────────────────────────────────────────

export const templateSdkAuth = PieceAuth.OAuth2({
  required: true,
  authUrl: 'https://provider.example.com/oauth/authorize',
  tokenUrl: 'https://provider.example.com/oauth/token',
  scope: ['read', 'write'],
  // pkce: true,  // uncomment if the provider requires PKCE
});

// ── Alternative: API key auth ─────────────────────────────────────────────────
//
// export const templateSdkAuth = PieceAuth.SecretText({
//   displayName: 'API Key',
//   required: true,
//   description: 'Go to Settings → API Keys to generate a key.',
//   validate: async ({ auth }) => {
//     const client = makeClient({ secret_text: auth } as any);
//     const { error } = await tryCatch(() => client.me());
//     return error
//       ? { valid: false, error: 'Invalid API key.' }
//       : { valid: true };
//   },
// });
