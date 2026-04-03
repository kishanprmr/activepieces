import {
  AuthenticationType,
  HttpError,
  HttpMessageBody,
  HttpMethod,
  httpClient,
  QueryParams,
} from '@activepieces/pieces-common';
import { tryCatch } from '@activepieces/shared';
import {
  CreateResourceBody,
  CustomField,
  PaginatedResponse,
  Project,
  RegisteredWebhook,
  Resource,
  UpdateResourceBody,
  User,
} from './types';

const BASE_URL = 'https://api.example.com/v1';

// ─────────────────────────────────────────────────────────────────────────────
// Private infrastructure — never import these outside client.ts
// ─────────────────────────────────────────────────────────────────────────────

type ApiCallParams = {
  auth: string;
  method: HttpMethod;
  resourceUri: string;
  query?: QueryParams;
  body?: unknown;
};

async function makeApiCall<T extends HttpMessageBody>(params: ApiCallParams): Promise<T> {
  const { data, error } = await tryCatch(() =>
    httpClient.sendRequest<T>({
      method: params.method,
      url: BASE_URL + params.resourceUri,
      authentication: { type: AuthenticationType.BEARER_TOKEN, token: params.auth },
      queryParams: params.query,
      body: params.body,
    })
  );

  if (error) {
    if (error instanceof HttpError) {
      const status = error.response.status;
      const body = error.response.body as { message?: string; error?: string } | undefined;
      const apiMessage = body?.message ?? body?.error ?? 'Unknown error from API';

      if (status === 401) throw new Error('Authentication failed. Check your API key.');
      if (status === 403) throw new Error('Permission denied. Your key lacks the required scope.');
      if (status === 429) throw new Error('Rate limit exceeded. Try again in a moment.');
      throw new Error(`API error (${status}): ${apiMessage}`);
    }
    throw error;
  }

  return data.body;
}

async function makePaginatedApiCall<T>(params: ApiCallParams): Promise<T[]> {
  const results: T[] = [];
  let offset = 0;
  const limit = 100;
  let hasMore = true;

  do {
    const page = await makeApiCall<PaginatedResponse<T>>({
      ...params,
      query: { ...params.query, limit: String(limit), offset: String(offset) },
    });
    results.push(...page.data);
    hasMore = page.has_more;
    offset += limit;
  } while (hasMore);

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exported named functions — one per endpoint.
// Actions and props ONLY call these. They never import httpClient directly.
// ─────────────────────────────────────────────────────────────────────────────

export async function listUsers(auth: string): Promise<User[]> {
  return makePaginatedApiCall<User>({ auth, method: HttpMethod.GET, resourceUri: '/users' });
}

export async function listProjects(auth: string, workspaceId?: string): Promise<Project[]> {
  return makePaginatedApiCall<Project>({
    auth,
    method: HttpMethod.GET,
    resourceUri: '/projects',
    query: workspaceId ? { workspace_id: workspaceId } : undefined,
  });
}

export async function listCustomFields(auth: string, objectType: string): Promise<CustomField[]> {
  return makePaginatedApiCall<CustomField>({
    auth,
    method: HttpMethod.GET,
    resourceUri: `/custom-fields/${objectType}`,
  });
}

export async function listResources(
  auth: string,
  projectId: string,
  updatedAfterMs?: number
): Promise<Resource[]> {
  const query: QueryParams = { project_id: projectId };
  if (updatedAfterMs) {
    query['updated_after'] = new Date(updatedAfterMs).toISOString();
  }
  return makePaginatedApiCall<Resource>({ auth, method: HttpMethod.GET, resourceUri: '/resources', query });
}

export async function createResource(auth: string, body: CreateResourceBody): Promise<Resource> {
  return makeApiCall<Resource>({ auth, method: HttpMethod.POST, resourceUri: '/resources', body });
}

export async function updateResource(
  auth: string,
  id: string,
  body: UpdateResourceBody
): Promise<Resource> {
  return makeApiCall<Resource>({ auth, method: HttpMethod.PATCH, resourceUri: `/resources/${id}`, body });
}

export async function deleteResource(auth: string, id: string): Promise<void> {
  return makeApiCall<void>({ auth, method: HttpMethod.DELETE, resourceUri: `/resources/${id}` });
}

export async function registerWebhook(
  auth: string,
  url: string,
  events: string[]
): Promise<RegisteredWebhook> {
  return makeApiCall<RegisteredWebhook>({
    auth,
    method: HttpMethod.POST,
    resourceUri: '/webhooks',
    body: { url, events },
  });
}

export async function deleteWebhook(auth: string, webhookId: string): Promise<void> {
  return makeApiCall<void>({ auth, method: HttpMethod.DELETE, resourceUri: `/webhooks/${webhookId}` });
}
