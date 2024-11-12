import { googleSheetsAuth } from '../../';
import { createAction } from '@activepieces/pieces-framework';
import {
  Dimension,
  getHeaders,
  googleSheetsCommon,
  ValueInputOption,
} from '../common/common';
import { getWorkSheetName } from '../triggers/helpers';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';

export const insertMultipleRowsAction = createAction({
  auth: googleSheetsAuth,
  name: 'google-sheets-insert-multiple-rows',
  displayName: 'Insert Multiple Rows',
  description: 'Add one or more new rows in a specific spreadsheet.',
  props: {
    spreadsheet_id: googleSheetsCommon.spreadsheet_id,
    include_team_drives: googleSheetsCommon.include_team_drives,
    sheet_id: googleSheetsCommon.sheet_id,
    as_string: googleSheetsCommon.as_string,
    values: googleSheetsCommon.valuesForMultipleRows,
    headersAsKeys: googleSheetsCommon.headersAsKeysForInsert,
  },

  async run(context) {
    const spreadSheetId = context.propsValue.spreadsheet_id;
    const sheetId = context.propsValue.sheet_id;
    const rowValuesInput: Record<string, string>[] =
      context.propsValue.values['values'];

    const sheetName = await getWorkSheetName(
      context.auth,
      spreadSheetId,
      sheetId
    );
    const headers = await getHeaders({
      accessToken: context.auth['access_token'],
      sheetName: sheetName,
      spreadSheetId: spreadSheetId,
    });

    let formattedValues;

    if (isArrayOfArrays(rowValuesInput)) {
      formattedValues = rowValuesInput as any[];
    } else {
      formattedValues = rowValuesInput.map((row) => {
        return Object.keys(row).reduce((acc, column) => {
          const columnIndexInHeaders = headers.findIndex(
            (header) => header === column
          );
          if (columnIndexInHeaders > -1) {
            acc[columnIndexInHeaders] = row[column];
          }
          return acc;
        }, [] as string[]);
      });
    }

    const authClient = new OAuth2Client();
    authClient.setCredentials(context.auth);

    const sheets = google.sheets({ version: 'v4', auth: authClient });

    const response = await sheets.spreadsheets.values.append({
      range: sheetName + '!A:A',
      spreadsheetId: spreadSheetId,
      valueInputOption: context.propsValue.as_string
        ? ValueInputOption.RAW
        : ValueInputOption.USER_ENTERED,
      requestBody: {
        values: formattedValues,
        majorDimension: Dimension.ROWS,
      },
    });
    return response.data;
  },
});

function isArrayOfArrays(value: any): boolean {
  return Array.isArray(value) && value.every((item) => Array.isArray(item));
}
