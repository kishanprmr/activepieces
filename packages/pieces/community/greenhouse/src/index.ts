import { createPiece, PieceAuth } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';

export const greenhouseAUth = PieceAuth.SecretText({
  displayName:'Harvest API Key',
  required:true,
  description:`In order to create a Harvest API key, a user must be granted the "Can manage ALL organization's API Credentials" in the "Developer permission" section. That user can then go Configure >> Dev Center >> API Credential Management.`
})

export const greenhouse = createPiece({
	displayName: 'Greenhouse',
	auth: greenhouseAUth,
	minimumSupportedRelease: '0.36.1',
	logoUrl: 'https://cdn.activepieces.com/pieces/greenhouse.png',
  categories:[PieceCategory.HUMAN_RESOURCES],
	authors: ['kishanprmr'],
	actions: [],
	triggers: [],
});
