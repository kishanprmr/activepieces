// ─────────────────────────────────────────────────────────────────────────────
// API response shapes. Keep types flat and minimal — only the fields you use.
// Add new types here as the piece grows; never use `any` or skip typing.
// ─────────────────────────────────────────────────────────────────────────────

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Project = {
  id: string;
  name: string;
  workspace_id: string;
};

export type Resource = {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  project_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CustomField = {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select';
  choices?: string[];
};

// ── Request body types (what you POST/PATCH to the API) ──────────────────────

export type CreateResourceBody = {
  title: string;
  description?: string;
  assignee_id?: string;
  project_id?: string;
  status?: string;
};

export type UpdateResourceBody = Partial<CreateResourceBody>;

// ── Webhook registration ──────────────────────────────────────────────────────

export type RegisteredWebhook = {
  id: string;
  url: string;
  events: string[];
};

// ── Paginated API wrapper (common pattern) ────────────────────────────────────

export type PaginatedResponse<T> = {
  data: T[];
  has_more: boolean;
  total?: number;
};
