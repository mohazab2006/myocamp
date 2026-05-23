import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { GmailCredentials } from "@/lib/types";

/**
 * Google OAuth + Gmail API client.
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID         OAuth 2.0 client id (Web application)
 *   GOOGLE_CLIENT_SECRET     OAuth 2.0 client secret
 *   GOOGLE_OAUTH_REDIRECT    optional override; otherwise derived from request origin
 *
 * Scope: gmail.readonly (we never modify, mark as read, or delete).
 *
 * Token lifecycle:
 *   - Owner clicks "Connect Gmail" → /api/gmail/oauth/start → Google consent
 *   - Google redirects back to /api/gmail/oauth/callback with ?code=
 *   - We exchange for access + refresh tokens, store in gmail_credentials
 *   - Polling loop calls getActiveGmailClient() which auto-refreshes when needed
 */

export const GMAIL_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: "Bearer";
  id_token?: string;
}

export interface GoogleUserinfoResponse {
  email: string;
  verified_email?: boolean;
  name?: string;
}

// ---------------------------------------------------------------------------
// Env helpers
// ---------------------------------------------------------------------------

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function requireGoogleEnv(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth not configured. Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET.");
  }
  return { clientId, clientSecret };
}

export function getRedirectUri(origin: string): string {
  return (
    process.env.GOOGLE_OAUTH_REDIRECT ?? `${origin.replace(/\/$/, "")}/api/gmail/oauth/callback`
  );
}

// ---------------------------------------------------------------------------
// OAuth — authorization URL
// ---------------------------------------------------------------------------

export function buildGoogleAuthUrl(origin: string, state: string): string {
  const { clientId } = requireGoogleEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(origin),
    response_type: "code",
    scope: `${GMAIL_SCOPE} https://www.googleapis.com/auth/userinfo.email`,
    access_type: "offline",        // ensure we get a refresh_token
    prompt: "consent",             // force re-consent so refresh_token always returns
    include_granted_scopes: "true",
    state
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// OAuth — code exchange + refresh
// ---------------------------------------------------------------------------

export async function exchangeCodeForTokens(
  code: string,
  origin: string
): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = requireGoogleEnv();
  const params = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: getRedirectUri(origin),
    grant_type: "authorization_code"
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokenResponse> {
  const { clientId, clientSecret } = requireGoogleEnv();
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token"
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token refresh failed (${res.status}): ${text}`);
  }
  return (await res.json()) as GoogleTokenResponse;
}

export async function fetchGoogleUserinfo(accessToken: string): Promise<GoogleUserinfoResponse> {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google userinfo failed (${res.status}): ${text}`);
  }
  return (await res.json()) as GoogleUserinfoResponse;
}

// ---------------------------------------------------------------------------
// Credentials persistence
// ---------------------------------------------------------------------------

type GmailCredentialsRow = {
  email: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  scope: string;
  last_polled_at: string | null;
  last_polled_status: "ok" | "error" | null;
  last_polled_error: string | null;
  last_messages_seen: number;
  last_messages_matched: number;
  created_at: string;
  updated_at: string;
};

function rowToCreds(row: GmailCredentialsRow): GmailCredentials {
  return {
    email: row.email,
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    tokenExpiresAt: row.token_expires_at,
    scope: row.scope,
    lastPolledAt: row.last_polled_at,
    lastPolledStatus: row.last_polled_status,
    lastPolledError: row.last_polled_error,
    lastMessagesSeen: row.last_messages_seen,
    lastMessagesMatched: row.last_messages_matched,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function fetchGmailCredentials(): Promise<GmailCredentials | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("gmail_credentials")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCreds(data as GmailCredentialsRow);
}

export async function saveGmailCredentials(
  email: string,
  tokens: GoogleTokenResponse,
  existingRefreshToken?: string
): Promise<GmailCredentials> {
  const supabase = createSupabaseAdminClient();
  const refreshToken = tokens.refresh_token ?? existingRefreshToken;
  if (!refreshToken) {
    throw new Error("Google did not return a refresh_token. Re-authorize with prompt=consent.");
  }
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

  const { data, error } = await supabase
    .from("gmail_credentials")
    .upsert(
      {
        email,
        access_token: tokens.access_token,
        refresh_token: refreshToken,
        token_expires_at: expiresAt,
        scope: tokens.scope
      },
      { onConflict: "email" }
    )
    .select("*")
    .single();

  if (error) throw new Error(`Could not save Gmail credentials: ${error.message}`);
  return rowToCreds(data as GmailCredentialsRow);
}

export async function disconnectGmail(email: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase.from("gmail_credentials").delete().eq("email", email);
  // Optional: revoke at Google too. For MVP we leave the consent; owner can revoke
  // manually at https://myaccount.google.com/permissions
}

export async function updatePollHeartbeat(
  email: string,
  outcome: { status: "ok" | "error"; error?: string | null; messagesSeen: number; messagesMatched: number }
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from("gmail_credentials")
    .update({
      last_polled_at: new Date().toISOString(),
      last_polled_status: outcome.status,
      last_polled_error: outcome.error ?? null,
      last_messages_seen: outcome.messagesSeen,
      last_messages_matched: outcome.messagesMatched
    })
    .eq("email", email);
}

/**
 * Return a valid access token, refreshing in-place if it expires within 60s.
 * Updates the persisted row on refresh so other callers reuse the new token.
 */
export async function getValidAccessToken(creds: GmailCredentials): Promise<string> {
  const expiresAt = new Date(creds.tokenExpiresAt).getTime();
  if (expiresAt - Date.now() > 60_000) {
    return creds.accessToken;
  }
  const refreshed = await refreshAccessToken(creds.refreshToken);
  await saveGmailCredentials(creds.email, refreshed, creds.refreshToken);
  return refreshed.access_token;
}

// ---------------------------------------------------------------------------
// Gmail API — list + get
// ---------------------------------------------------------------------------

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";

export interface GmailMessageRef {
  id: string;
  threadId: string;
}

export interface GmailListResponse {
  messages?: GmailMessageRef[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export interface GmailMessagePart {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: Array<{ name: string; value: string }>;
  body?: { size?: number; data?: string };
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string; // ms epoch as string
  payload?: GmailMessagePart;
}

export async function listInteracMessages(
  accessToken: string,
  query: string,
  maxResults = 50
): Promise<GmailMessageRef[]> {
  const url = new URL(`${GMAIL_API_BASE}/users/me/messages`);
  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", String(maxResults));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail list failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as GmailListResponse;
  return json.messages ?? [];
}

export async function getGmailMessage(
  accessToken: string,
  messageId: string
): Promise<GmailMessage> {
  const url = new URL(`${GMAIL_API_BASE}/users/me/messages/${encodeURIComponent(messageId)}`);
  url.searchParams.set("format", "full");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail get failed for ${messageId} (${res.status}): ${text}`);
  }
  return (await res.json()) as GmailMessage;
}

// ---------------------------------------------------------------------------
// MIME helpers — decode Gmail's base64url message bodies and headers
// ---------------------------------------------------------------------------

export function decodeBase64Url(input: string): string {
  // Gmail uses base64url; Node Buffer doesn't understand the URL-safe variant directly.
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  // Pad to multiple of 4.
  const padded = normalized + "==".slice((normalized.length + 3) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

export function getHeader(message: GmailMessage, name: string): string | null {
  const headers = message.payload?.headers ?? [];
  const lower = name.toLowerCase();
  for (const h of headers) {
    if (h.name.toLowerCase() === lower) return h.value;
  }
  return null;
}

/** Walk a message tree and return the best plain-text and HTML bodies we can find. */
export function extractBodies(message: GmailMessage): { text: string; html: string } {
  let text = "";
  let html = "";

  function walk(part: GmailMessagePart | undefined) {
    if (!part) return;
    const mt = (part.mimeType ?? "").toLowerCase();
    const data = part.body?.data;
    if (data) {
      const decoded = decodeBase64Url(data);
      if (mt === "text/plain" && !text) text = decoded;
      else if (mt === "text/html" && !html) html = decoded;
    }
    if (part.parts) {
      for (const child of part.parts) walk(child);
    }
  }

  walk(message.payload);
  // Fallback: if we only got HTML, strip tags into plain text for the parser.
  if (!text && html) {
    text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
  return { text, html };
}
