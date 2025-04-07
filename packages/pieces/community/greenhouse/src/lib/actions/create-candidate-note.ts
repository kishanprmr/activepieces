import { greenhouseAUth } from '../../index';
import { createAction, Property } from '@activepieces/pieces-framework';
import { AuthenticationType, httpClient, HttpMethod,HttpRequest } from '@activepieces/pieces-common';

export const createCandidateNoteAction = createAction({
	auth: greenhouseAUth,
	name: 'create-candidate-note',
	displayName: 'Add Candidate Note',
	description: 'Adds a note to the candidate.',
	props: {
		candidateId:Property.ShortText({
			displayName:'Candidate ID',
			required:true
		}),
		userId:Property.ShortText({
			displayName:'On Behalf Of',
			description:'ID of the user issuing this request. Required for auditing purposes.',
			required:true
		}),
		note:Property.LongText({
			displayName:'Note',
			required:true
		}),
		visibility:Property.StaticDropdown({
			displayName:'Visibiity',
			required:true,
			options:{
				disabled:false,
				options:[
					{
						label:'Admin Only',
						value:'admin_only'
					},
					{
						label:'private',
						value:'private'
					},
					{
						label:'public',
						value:'public'
					}
				]
			}
		})

	},
	async run(context) {
		const request:HttpRequest = {
			method:HttpMethod.POST,
			url:`https://harvest.greenhouse.io/v1/candidates/${context.propsValue.candidateId}/activity_feed/notes`,
			authentication:{
				type:AuthenticationType.BASIC,
				username:context.auth,
				password:""
			},
			headers:{
				"On-Behalf-Of":`${context.propsValue.userId}`
			},
			body:{
				user_id:context.propsValue.userId,
				body:context.propsValue.note,
				visibility:context.propsValue.visibility
			}
		}

		const response = await httpClient.sendRequest(request);

		return response.body;
	},
});
