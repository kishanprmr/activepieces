import { EntityProp } from '../types';

export const customerPaymentsEntityProps: EntityProp[] = [
  {
    name: 'customerPaymentJournalId',
    displayName: 'Customer Payment Journal ID',
    type: 'dynamic_select',
    isRequired: false,
    options: {
      sourceFieldSlug: 'customerPaymentJournals',
      labelField: 'code',
    },
  },
  {
    name: 'documentNumber',
    displayName: 'Document Number',
    type: 'text',
    isRequired: false,
  },
  {
    name: 'customerId',
    displayName: 'Customer ID',
    type: 'dynamic_select',
    isRequired: false,
    options: {
      sourceFieldSlug: 'customers',
      labelField: 'displayName',
    },
  },
  {
    name: 'customerNumber',
    displayName: 'Customer Number',
    type: 'text',
    isRequired: false,
  },
  {
    name: 'postingDate',
    displayName: 'Posting Date',
    type: 'date',
    isRequired: false,
  },

  {
    name: 'amount',
    displayName: 'Amount',
    type: 'number',
    isRequired: false,
  },
  {
    name: 'appliesToInvoiceId',
    displayName: 'Invoice ID',
    type: 'text',
    isRequired: false,
  },
  {
    name: 'description',
    displayName: 'Description',
    type: 'text',
    isRequired: false,
  },
  {
    name: 'comment',
    displayName: 'Comment',
    type: 'text',
    isRequired: false,
  },
];

export const customerPaymentsEntityNumberProps = ['amount'];
