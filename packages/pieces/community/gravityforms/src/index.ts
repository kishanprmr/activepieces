import {
  PieceAuth,
  Property,
  createPiece,
} from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { gravityFormsNewSubmission } from './lib/triggers/new-submission';

export const gravityFormsAuth = PieceAuth.CustomAuth({
  required: true,
  description: `
  1. Find the **Site URL** in your WordPress Settings page under General > Site Address (URL).
  2. Navigate to Forms and open Settings. Go to **REST API** menu.
  3. In the REST API Settings, enable access to the API.
  4. Under Authentication (API version 2), click on Add Key.Add a description of the API key and select **Read/Write** in permissions drop-down.
  5. Copy your Consumer Key and Consumer Secret.`,
  props: {
    siteUrl: Property.ShortText({
      displayName: 'Site URL',
      required: true,
    }),
    consumerKey: Property.ShortText({
      displayName: 'Consumer Key',
      required: true,
    }),
    consumerSecret: Property.ShortText({
      displayName: 'Consumer Secret',
      required: true,
    }),
  },
});

export const gravityforms = createPiece({
  displayName: 'Gravity Forms',
  description: 'Build and publish your WordPress forms',

  auth: gravityFormsAuth,
  minimumSupportedRelease: '0.27.1',
  logoUrl: 'https://cdn.activepieces.com/pieces/gravityforms.svg',
  authors: ['Abdallah-Alwarawreh', 'kishanprmr', 'MoShizzle', 'abuaboud'],
  categories: [PieceCategory.FORMS_AND_SURVEYS],
  actions: [],
  triggers: [gravityFormsNewSubmission],
});
