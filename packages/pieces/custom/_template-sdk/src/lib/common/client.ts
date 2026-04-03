// Replace 'third-party-sdk' with the actual npm package name.
// import { ThirdPartySdk } from 'third-party-sdk';
import { AppConnectionValueForAuthProperty } from '@activepieces/pieces-framework';
import { templateSdkAuth } from '../..';

// ─────────────────────────────────────────────────────────────────────────────
// makeClient — the only way to get an SDK instance in this piece.
//
// Actions and props call makeClient(auth).someMethod() directly.
// The SDK's own types are used — no wrapper class needed.
//
// Why: a wrapper class adds indirection without benefit when the SDK already
// has a typed, stable surface area. Add one only if you need to augment or
// intercept SDK calls globally (e.g. retry logic the SDK doesn't support).
// ─────────────────────────────────────────────────────────────────────────────

export function makeClient(
  auth: AppConnectionValueForAuthProperty<typeof templateSdkAuth>
) {
  // Replace with the actual SDK constructor call.
  // return new ThirdPartySdk({ apiKey: auth.secret_text });

  // Placeholder: return a typed mock so the rest of the template compiles.
  return {
    resources: {
      create: async (_input: unknown) => ({ id: 'res_123', title: 'Mock' }),
      update: async (_id: string, _input: unknown) => ({ id: 'res_123', title: 'Mock' }),
      list: async (_vars: unknown) => ({
        nodes: [],
        pageInfo: { hasNextPage: false, endCursor: undefined },
      }),
    },
    teams: {
      list: async (_vars: unknown) => ({
        nodes: [{ id: 'team_1', name: 'Engineering' }],
        pageInfo: { hasNextPage: false, endCursor: undefined },
      }),
    },
    users: {
      list: async (_vars: unknown) => ({
        nodes: [{ id: 'usr_1', name: 'Alice', email: 'alice@example.com' }],
        pageInfo: { hasNextPage: false, endCursor: undefined },
      }),
    },
    webhooks: {
      create: async (_input: unknown) => ({ id: 'wh_abc' }),
      delete: async (_id: string) => ({}),
    },
  };
}
