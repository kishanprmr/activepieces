// ─────────────────────────────────────────────────────────────────────────────
// Types for the SDK-based template piece.
//
// When the SDK ships its own types, re-export or alias them here rather than
// duplicating them. Only define local types for shapes the SDK doesn't expose.
// ─────────────────────────────────────────────────────────────────────────────

// Example: if the SDK exports these, import them instead of redefining.
// import { Resource, User } from 'third-party-sdk';

export type SdkResource = {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  teamId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SdkUser = {
  id: string;
  name: string;
  email: string;
};

export type SdkTeam = {
  id: string;
  name: string;
};

export type PageInfo = {
  hasNextPage: boolean;
  endCursor?: string;
};

export type Connection<T> = {
  nodes: T[];
  pageInfo: PageInfo;
};

// Request input types (what you pass to SDK create/update methods)
export type CreateResourceInput = {
  title: string;
  description?: string;
  assigneeId?: string;
  teamId: string;
};

export type UpdateResourceInput = Partial<Omit<CreateResourceInput, 'teamId'>>;

// Stored webhook info for trigger lifecycle management
export type StoredWebhook = {
  webhookId: string;
};
