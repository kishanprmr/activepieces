import { PieceAuth } from '@activepieces/pieces-framework';

export const assembledAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  description: `You can obtain your API key by navigating to [Settings](https://app.assembledhq.com/settings/api).`,
  required: true,
});
