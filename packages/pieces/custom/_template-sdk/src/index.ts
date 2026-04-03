import { createPiece } from '@activepieces/pieces-framework';
import { PieceCategory } from '@activepieces/shared';
import { createResourceAction } from './lib/actions/create-resource';
import { newResourceTrigger } from './lib/triggers/new-resource';
import { recordUpdatedTrigger } from './lib/triggers/record-updated';

export { templateSdkAuth } from './lib/auth';

// Re-export auth so lib files can import it without a long relative path.
// import { templateSdkAuth } from '../..';  ← works in any lib/**/*.ts file

import { templateSdkAuth } from './lib/auth';

export const templateSdkPiece = createPiece({
  displayName: 'Template (SDK)',
  description: 'Copy this template when building a piece that wraps an npm SDK.',

  auth: templateSdkAuth,
  minimumSupportedRelease: '0.30.0',
  logoUrl: 'https://cdn.activepieces.com/pieces/custom.png',
  authors: ['your-github-username'],
  categories: [PieceCategory.DEVELOPER_TOOLS],

  actions: [
    createResourceAction,
  ],

  triggers: [
    newResourceTrigger,
    recordUpdatedTrigger,
  ],
});
