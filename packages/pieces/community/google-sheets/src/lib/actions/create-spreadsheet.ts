import { createAction, Property } from '@activepieces/pieces-framework';
import { googleSheetsCommon } from '../common/common';
import { googleSheetsAuth } from '../..';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';

export const createSpreadsheetAction = createAction({
  auth: googleSheetsAuth,
  name: 'create-spreadsheet',
  displayName: 'Create Spreadsheet',
  description:'Creates a blank spreadsheet or duplicate an existing spreadsheet.',
  props: {
    title:Property.ShortText({
        displayName:'Title',
        description:'The title of the new spreadsheet.',
        required:true
    }),
    spreadsheet_id: googleSheetsCommon.spreadsheet_id(false,'Spreadsheet to Copy'),
    include_team_drives: googleSheetsCommon.include_team_drives,
   
  },
  async run(context){
    const spreadSheetId = context.propsValue.spreadsheet_id;
    const title = context.propsValue.title;

    const authClient = new OAuth2Client();
	authClient.setCredentials(context.auth);

	const sheets = google.sheets({ version: 'v4', auth: authClient });
    const drive = google.drive({ version: 'v3', auth: authClient });

    let newSpreadsheetId;

    if(spreadSheetId)
    {
        const response = await drive.files.copy({
            fileId:spreadSheetId,
            fields:'*',
            supportsAllDrives:true,
            requestBody:{
                name:title
            }
        })
        console.log(JSON.stringify(response));
        newSpreadsheetId = response.data.id
    }
    else
    {
        const response = await sheets.spreadsheets.create({
            requestBody:{
                properties:{
                    title
                }
            }
        })
        newSpreadsheetId = response.data.spreadsheetId
    }


  return{
    id:newSpreadsheetId
  }
    

  }})