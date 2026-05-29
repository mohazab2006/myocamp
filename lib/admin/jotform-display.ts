import { flattenJotformValue, parseRawRequest } from "@/lib/admin/jotform";

export type JotformResponseField = {
  key: string;
  label: string;
  value: string;
  multiline: boolean;
};

const SKIP_ANSWER_SLUGS = new Set([
  "submit",
  "captchafilled",
  "please skip this field",
  "pleaseskipthisfield"
]);

/** Webhook metadata — not parent-facing answers. */
const META_KEYS = new Set([
  "formid",
  "formID",
  "submissionid",
  "submissionID",
  "rawrequest",
  "pretty",
  "ip",
  "referrer",
  "user_agent",
  "useragent",
  "event_id",
  "eventid",
  "type",
  "webhookurl",
  "username",
  "timetosubmit",
  "fileserver",
  "temp_upload",
  "temp_upload_folder"
]);

function humanizeFieldKey(key: string): string {
  const slug = key.replace(/^q\d+_/i, "");
  const spaced = slug
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function isAnswerKey(key: string): boolean {
  if (!/^q\d+_/i.test(key)) return false;
  const slug = key
    .replace(/^q\d+_/i, "")
    .replace(/[_\s-]+/g, "")
    .toLowerCase();
  if (SKIP_ANSWER_SLUGS.has(slug)) return false;
  return true;
}

function extractAnswerMap(payload: Record<string, unknown>): Record<string, unknown> {
  const rawRequest = payload.rawRequest;
  if (typeof rawRequest === "string" && rawRequest.trim()) {
    const parsed = parseRawRequest(rawRequest);
    if (Object.keys(parsed).length > 0) return parsed;
  }

  const fromPayload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (isAnswerKey(key)) fromPayload[key] = value;
  }
  return fromPayload;
}

function formatValue(value: unknown): { text: string; multiline: boolean } {
  if (value == null || value === "") return { text: "", multiline: false };

  if (typeof value === "string" && /^https?:\/\//i.test(value.trim())) {
    return { text: value.trim(), multiline: false };
  }

  const flat = flattenJotformValue(value);
  if (!flat) return { text: "", multiline: false };

  const multiline = flat.includes("\n") || flat.length > 120;
  return { text: flat, multiline };
}

/** Turn stored raw_payload into labeled rows for admin display. */
export function formatJotformResponses(
  payload: Record<string, unknown> | null | undefined
): JotformResponseField[] {
  if (!payload || typeof payload !== "object") return [];

  if (payload._manualEntry === true) {
    return [];
  }

  const answers = extractAnswerMap(payload);
  const fields: JotformResponseField[] = [];

  for (const [key, value] of Object.entries(answers)) {
    if (!isAnswerKey(key)) continue;
    const { text, multiline } = formatValue(value);
    if (!text) continue;
    fields.push({
      key,
      label: humanizeFieldKey(key),
      value: text,
      multiline
    });
  }

  // Stable order: numeric q-id so fields match form order.
  fields.sort((a, b) => {
    const na = Number(a.key.match(/^q(\d+)_/i)?.[1] ?? 0);
    const nb = Number(b.key.match(/^q(\d+)_/i)?.[1] ?? 0);
    return na - nb;
  });

  return fields;
}

export function jotformSubmissionMeta(payload: Record<string, unknown> | null | undefined): {
  formId: string | null;
  submissionId: string | null;
} {
  if (!payload) return { formId: null, submissionId: null };
  const formId = String(payload.formID ?? payload.formId ?? "").trim() || null;
  const submissionId =
    String(payload.submissionID ?? payload.submissionId ?? "").trim() || null;
  return { formId, submissionId };
}

export function hasJotformResponses(payload: Record<string, unknown> | null | undefined): boolean {
  if (!payload || payload._manualEntry === true) return false;
  return formatJotformResponses(payload).length > 0;
}
