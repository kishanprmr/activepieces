# Pieces Contributor Guide

Use the templates in `_template-http/` (REST API) and `_template-sdk/` (npm SDK) as your starting point. Copy the relevant one and replace the placeholder names, URLs, and types.

---

## Directory Layout

```
src/
├── index.ts              ← piece + auth definition, re-exports auth
└── lib/
    ├── auth.ts           ← auth definition only
    ├── common/
    │   ├── client.ts     ← ALL api calls live here, nothing else
    │   ├── props.ts      ← reusable dropdowns and dynamic props
    │   └── types.ts      ← api response + request body types
    ├── actions/
    │   └── <verb>-<noun>.ts    e.g. create-issue.ts, update-contact.ts
    └── triggers/
        └── <noun>-<event>.ts   e.g. new-issue.ts, record-updated.ts
```

---

## The Golden Rules

1. **`httpClient.sendRequest` only in `client.ts`** — actions and triggers never import it.
2. **Every dropdown guards `!auth`** — return `disabledDropdown('Connect your account first')`.
3. **Never throw in dropdown `options`** — use `tryCatch`, return `disabledDropdown` on error.
4. **Props.ts is for shared props only** — scalar inputs (ShortText, Number, etc.) stay inline in the action.
5. **Every webhook trigger stores its webhook ID** in `ctx.store` and deletes it in `onDisable`.
6. **Every trigger has `sampleData`** — match the actual API response shape.
7. **Auth must have a `validate` function** that tests credentials against the real API.
8. **All API response types go in `types.ts`** — no implicit `any` anywhere.

---

## `auth.ts`

### API Key
```ts
export const myAuth = PieceAuth.SecretText({
  displayName: 'API Key',
  required: true,
  description: '...',
  validate: async ({ auth }) => {
    const { error } = await tryCatch(() =>
      httpClient.sendRequest({
        method: HttpMethod.GET,
        url: 'https://api.example.com/v1/me',
        headers: { Authorization: `Bearer ${auth}` },
      })
    );
    return error ? { valid: false, error: 'Invalid API key.' } : { valid: true };
  },
});
```

### OAuth2
```ts
export const myAuth = PieceAuth.OAuth2({
  required: true,
  authUrl: 'https://provider.com/oauth/authorize',
  tokenUrl: 'https://provider.com/oauth/token',
  scope: ['read', 'write'],
});
```

### Custom (multi-field — domain + key)
```ts
export const myAuth = PieceAuth.CustomAuth({
  displayName: 'Connection',
  props: {
    apiKey:    PieceAuth.SecretText({ displayName: 'API Key', required: true }),
    subdomain: Property.ShortText({ displayName: 'Subdomain', required: true }),
  },
  validate: async ({ auth }) => { ... },
});
```

---

## `client.ts` — HTTP pieces

Two private base helpers + one named export per endpoint:

```ts
// Private — infrastructure only, never imported outside this file.
async function makeApiCall<T>(params): Promise<T> { ... }
async function makePaginatedApiCall<T>(params): Promise<T[]> { ... }

// Exported — one per endpoint. This is the only API surface actions/props touch.
export async function listUsers(auth: string): Promise<User[]> { ... }
export async function createResource(auth: string, body: CreateResourceBody): Promise<Resource> { ... }
export async function registerWebhook(auth: string, url: string, events: string[]): Promise<{ id: string }> { ... }
export async function deleteWebhook(auth: string, id: string): Promise<void> { ... }
```

**Error handling in `makeApiCall`** — convert `HttpError` to clean messages, never let the raw JSON blob bubble up:
```ts
if (error instanceof HttpError) {
  const status = error.response.status;
  const body = error.response.body as { message?: string } | undefined;
  if (status === 401) throw new Error('Authentication failed. Check your API key.');
  if (status === 429) throw new Error('Rate limit exceeded. Try again in a moment.');
  throw new Error(`API error (${status}): ${body?.message ?? 'Unknown error'}`);
}
```

## `client.ts` — SDK pieces

```ts
export function makeClient(auth: AppConnectionValueForAuthProperty<typeof myAuth>) {
  return new ThirdPartySdk({ apiKey: auth.secret_text });
}
```

No wrapper class. Actions call `makeClient(auth).someMethod()` using the SDK's own types.

---

## `props.ts`

### Factory signature rules

| Case | Signature |
|------|-----------|
| Only `required` varies | `user_id: (required = true) =>` |
| Display name or description also vary | `user_id: (options: { required?: boolean; displayName?: string } = {}) =>` |
| Extra semantic param (e.g. `objectType`) | `custom_fields: (objectType: string, options: { required?: boolean } = {}) =>` |

Never use extra positional params: `(required, displayName, description)` is unreadable at the call site.

### Prop key naming

| Pattern | Example |
|---------|---------|
| `<noun>_id` — single ID value | `user_id`, `team_id` |
| `<noun>_ids` — multi-select IDs | `user_ids`, `label_ids` |
| `<noun>` — enum / static value | `status`, `priority` |
| `custom_fields` | always use this key for `DynamicProperties` |

### `disabledDropdown` — imported from framework

```ts
import { disabledDropdown } from '@activepieces/pieces-framework';

// Guard (no auth):
if (!auth) return disabledDropdown('Connect your account first');
// Guard (missing parent prop):
if (!team_id) return disabledDropdown('Select a team first');
// Error:
if (error) return disabledDropdown('Failed to load users — check your connection');
```

### What goes in `props.ts` vs inline in the action

| In `props.ts` | Inline in action |
|---------------|-----------------|
| Dropdown (API-fetched) | ShortText, LongText |
| MultiSelectDropdown | Number, Checkbox |
| StaticDropdown (if used in 2+ actions) | DateTime, Json, File |
| DynamicProperties | One-off StaticDropdown |

### Dropdown with cursor pagination (SDK)

```ts
const options: DropdownOption<string>[] = [];
let cursor: string | undefined;
let hasNextPage = false;

do {
  const page = await client.teams.list({ first: 100, after: cursor });
  for (const team of page.nodes) options.push({ label: team.name, value: team.id });
  hasNextPage = page.pageInfo.hasNextPage;
  cursor = page.pageInfo.endCursor;
} while (hasNextPage);
```

### Dropdown with offset pagination (HTTP)

```ts
// This lives inside makePaginatedApiCall in client.ts — not in props.ts.
// Props just call: const users = await listUsers(auth);
```

---

## Action structure

```ts
export const createResourceAction = createAction({
  auth: myAuth,
  name: 'create_resource',      // snake_case, unique within the piece
  displayName: 'Create Resource',
  description: 'Creates a new resource.',
  props: {
    // 1. Inline scalars first
    title:         Property.ShortText({ displayName: 'Title', required: true }),
    description:   Property.LongText({ displayName: 'Description', required: false }),
    // 2. Reused dropdowns from props.ts second
    team_id:       props.team_id(),
    user_id:       props.user_id(false),
    status:        props.status(),
    // 3. Dynamic props last
    custom_fields: props.custom_fields('resource'),
  },
  async run({ auth, propsValue }) {
    return createResource(auth as string, { ... });
  },
});
```

---

## Webhook trigger

```ts
export const newResourceTrigger = createTrigger({
  type: TriggerStrategy.WEBHOOK,
  // ...
  async onEnable(ctx) {
    const webhook = await registerWebhook(ctx.auth as string, ctx.webhookUrl, ['resource.created']);
    await ctx.store?.put('_webhook_id', { webhookId: webhook.id });
  },
  async onDisable(ctx) {
    const stored = await ctx.store?.get<{ webhookId: string }>('_webhook_id');
    if (stored?.webhookId) await deleteWebhook(ctx.auth as string, stored.webhookId);
  },
  async run(ctx) {
    const body = ctx.payload.body as { event: string; data: unknown };
    if (body.event === 'resource.created') return [body.data];
    return [];
  },
});
```

## Polling trigger

```ts
const polling: Polling<string, { project_id: string }> = {
  strategy: DedupeStrategy.TIMEBASED,
  items: async ({ auth, propsValue, lastFetchEpochMS }) => {
    const records = await listResources(auth, propsValue.project_id, lastFetchEpochMS);
    return records.map(r => ({ epochMilliSeconds: new Date(r.updated_at).getTime(), data: r }));
  },
};

// Then in the trigger: delegate all four methods to pollingHelper.
async test(ctx)      { return pollingHelper.test(polling, { auth: ctx.auth, store: ctx.store, propsValue: ctx.propsValue, files: ctx.files }); }
async onEnable(ctx)  { await pollingHelper.onEnable(polling, { auth: ctx.auth, store: ctx.store, propsValue: ctx.propsValue }); }
async onDisable(ctx) { await pollingHelper.onDisable(polling, { auth: ctx.auth, store: ctx.store, propsValue: ctx.propsValue }); }
async run(ctx)       { return pollingHelper.poll(polling, { auth: ctx.auth, store: ctx.store, propsValue: ctx.propsValue, files: ctx.files }); }
```

---

## `tryCatch` — go-style error handling

```ts
import { tryCatch } from '@activepieces/shared';

// ✅ Pass a function, not a promise
const { data, error } = await tryCatch(() => someAsyncCall());

// ❌ Wrong — this passes a Promise directly
const { data, error } = await tryCatch(someAsyncCall());
```

---

## File order (required by CLAUDE.md)

```
imports
↓
exported functions / constants
↓
helper functions (non-exported)
↓
types
```
