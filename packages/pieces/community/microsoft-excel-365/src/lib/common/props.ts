import { excelAuth } from '../../index';
import { DropdownOption, Property } from '@activepieces/pieces-framework';
import { createMSGraphClient, getHeaders } from './helpers';
import { PageCollection } from '@microsoft/microsoft-graph-client';
import { Drive, DriveItem, Site } from '@microsoft/microsoft-graph-types';

export const commonProps = {
	storageSource: Property.StaticDropdown({
		displayName: 'Excel File Source',
		required: true,
		defaultValue: 'onedrive',
		options: {
			disabled: false,
			options: [
				{ label: 'OneDrive', value: 'onedrive' },
				{ label: 'SharePoint', value: 'sharepoint' },
			],
		},
	}),
	siteId: Property.Dropdown({
		displayName: 'Sharepoint Site',
		auth: excelAuth,
		refreshers: ['storageSource'],
		required: false,
		options: async ({ auth, storageSource }) => {
			if (!auth) {
				return {
					disabled: true,
					options: [],
					placeholder: 'please connect your account first.',
				};
			}
			if (storageSource !== 'sharepoint') {
				return {
					disabled: true,
					options: [],
					placeholder: 'please select sharepoint as file source.',
				};
			}
			const client = createMSGraphClient(auth.access_token);

			const options: DropdownOption<string>[] = [];

			let response: PageCollection = await client
				.api('/sites?search=*&$select=displayName,id,name')
				.get();

			while (response.value.length > 0) {
				for (const site of response.value as Site[]) {
					options.push({ label: site.displayName!, value: site.id! });
				}
				if (response['@odata.nextLink']) {
					response = await client.api(response['@odata.nextLink']).get();
				} else {
					break;
				}
			}

			return {
				disabled: false,
				options,
			};
		},
	}),
	documentId: Property.Dropdown({
		displayName: 'Sharepoint Document Library',
		auth: excelAuth,
		refreshers: ['storageSource', 'siteId'],
		required: false,
		options: async ({ auth, storageSource, siteId }) => {
			if (!auth) {
				return {
					disabled: true,
					options: [],
					placeholder: 'please connect your account first.',
				};
			}
			if (storageSource !== 'sharepoint') {
				return {
					disabled: true,
					options: [],
					placeholder: 'please select sharepoint as file source.',
				};
			}

			if (!siteId) {
				return {
					disabled: true,
					options: [],
					placeholder: 'please select sharepoint site first.',
				};
			}

			const client = createMSGraphClient(auth.access_token);

			const options: DropdownOption<string>[] = [];

			let response: PageCollection = await client
				.api(`/sites/${siteId}/drives`)
				.select('id,name')
				.get();

			while (response.value.length > 0) {
				for (const drive of response.value as Drive[]) {
					options.push({ label: drive.name!, value: drive.id! });
				}
				if (response['@odata.nextLink']) {
					response = await client.api(response['@odata.nextLink']).get();
				} else {
					break;
				}
			}

			return {
				disabled: false,
				options,
			};
		},
	}),
	workbookId: Property.Dropdown({
		displayName: 'Workbook',
		refreshers: ['storageSource', 'siteId', 'docuemntId'],
		required: true,
		auth: excelAuth,
		options: async ({ auth, storageSource, siteId, documentId }) => {
			if (!auth) {
				return {
					disabled: true,
					options: [],
					placeholder: 'please connect your account first.',
				};
			}
			if (storageSource === 'sharepoint' && (!siteId || !documentId)) {
				return {
					disabled: true,
					options: [],
					placeholder: 'please select SharePoint site and document library first.',
				};
			}

			const client = createMSGraphClient(auth.access_token);

			const options: DropdownOption<string>[] = [];

			const drivePath =
				storageSource === 'onedrive'
					? '/me/drive'
					: `/sites/${siteId}/drives/${documentId}`;

			let response: PageCollection = await client
				.api(`${drivePath}/root/search(q='.xlsx')`)
				.select('id,name')
				.get();

			while (response.value.length > 0) {
				for (const file of response.value as DriveItem[]) {
					options.push({ label: file.name!, value: file.id! });
				}
				if (response['@odata.nextLink']) {
					response = await client.api(response['@odata.nextLink']).get();
				} else {
					break;
				}
			}

			return {
				disabled: false,
				options,
			};
		},
	}),
	worksheetId: Property.Dropdown({
		auth: excelAuth,
		displayName: 'Worksheet',
		required: true,
		refreshers: ['storageSource', 'siteId', 'documentId', 'workbookId'],
		options: async ({ auth, storageSource, siteId, documentId, workbookId }) => {
			if (!auth) {
				return {
					disabled: true,
					options: [],
					placeholder: 'please connect your account first.',
				};
			}

			if (!workbookId) {
				return {
					disabled: true,
					options: [],
					placeholder: 'please select a workbook first.',
				};
			}

			if (storageSource === 'sharepoint' && (!siteId || !documentId)) {
				return {
					disabled: true,
					options: [],
					placeholder: 'please select SharePoint site and document library first.',
				};
			}
			const client = createMSGraphClient(auth.access_token);

			const drivePath =
				storageSource === 'onedrive'
					? '/me/drive'
					: `/sites/${siteId}/drives/${documentId}`;

			const response: PageCollection = await client
				.api(`${drivePath}/items/${workbookId}/workbook/worksheets`)
				.select('id,name')
				.get();

			return {
				disabled: false,
				options: response.value.map((worksheet: { id: string; name: string }) => {
					return {
						label: worksheet.name,
						value: worksheet.name,
					};
				}),
			};
		},
	}),
	worksheetValues: Property.DynamicProperties({
		auth: excelAuth,
		displayName: 'Values',
		description: 'The values to insert',
		required: true,
		refreshers: [
			'storageSource',
			'siteId',
			'documentId',
			'workbookId',
			'worksheetId',
			'isFirstRowHeaders',
		],
		props: async ({
			auth,
			storageSource,
			siteId,
			workbookId,
			documentId,
			worksheetId,
			isFirstRowHeaders,
		}) => {
			if (
				!auth ||
				(workbookId ?? '').toString().length === 0 ||
				(worksheetId ?? '').toString().length === 0
			) {
				return {};
			}

			if (storageSource === 'sharepoint' && (!siteId || !documentId)) return {};

			if (!isFirstRowHeaders) {
				return {
					values: Property.Array({
						displayName: 'Values',
						required: true,
					}),
				};
			}

			const drivePath =
				storageSource === 'onedrive'
					? '/me/drive'
					: `/sites/${siteId}/drives/${documentId}`;

			const firstRow = await getHeaders(
				auth.access_token,
				drivePath,
				workbookId as unknown as string,
				worksheetId as unknown as string
			);

			const properties: {
				[key: string]: any;
			} = {};
			for (const key in firstRow) {
				properties[key] = Property.ShortText({
					displayName: firstRow[key].toString(),
					description: firstRow[key].toString(),
					required: false,
					defaultValue: '',
				});
			}
			return properties;
		},
	}),
};
