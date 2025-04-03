import { greenhouseAUth } from '../../index';
import { createAction } from '@activepieces/pieces-framework';

export const createCandidateNoteAction = createAction({
	auth: greenhouseAUth,
	name: 'create-candidate-note',
	displayName: 'Add Candidate Note',
	description: '',
	props: {},
	async run(context) {},
});
