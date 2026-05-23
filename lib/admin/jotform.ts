/**
 * JotForm payload parser.
 *
 * JotForm sends submissions as multipart/form-data with these meaningful keys:
 *   - formID            (numeric ID of the form)
 *   - submissionID      (numeric ID of this submission)
 *   - rawRequest        (URL-encoded JSON string of every answer)
 *   - pretty            (human-readable "Question:Answer, …" string)
 *
 * Field names inside rawRequest look like `q3_parentName`, `q5_email`,
 * `q11_phoneNumber`. We strip the `q\d+_` prefix to get the slug, then run
 * a small alias table + heuristic against it.
 *
 * If extraction misses, the admin can edit the registration manually — we
 * always store the full raw payload so nothing is lost.
 */

import type { CamperInfo } from "@/lib/types";

export interface ParsedSubmission {
  formId: string;
  submissionId: string;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  campers: CamperInfo[];
  rawPayload: Record<string, unknown>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const PHONE_RE = /[\d().+\-\s]{7,}/;

const PARENT_NAME_ALIASES = [
  "parentname",
  "parentsname",
  "parentfullname",
  "guardianname",
  "name",
  "fullname",
  "yourname",
  "contactname"
];

const PARENT_EMAIL_ALIASES = [
  "parentemail",
  "guardianemail",
  "email",
  "emailaddress",
  "contactemail"
];

const PARENT_PHONE_ALIASES = [
  "parentphone",
  "guardianphone",
  "phone",
  "phonenumber",
  "telephone",
  "mobile",
  "cell",
  "contactphone"
];

const CAMPER_NAME_ALIASES = [
  "campername",
  "childname",
  "childsname",
  "participantname",
  "kidname",
  "studentname",
  "youthname"
];

const CAMPER_AGE_ALIASES = ["camperage", "childage", "participantage", "kidage", "age"];

/** Strip "q3_" / "q12_" prefix and lower-case for matching. */
function normalizeKey(key: string): string {
  return key
    .replace(/^q\d+_/, "")
    .replace(/[_\s-]+/g, "")
    .toLowerCase();
}

/** Coerce JotForm field value (string | object | array) into a flat string. */
function flatten(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(flatten).filter(Boolean).join(" ");
  if (typeof value === "object") {
    // JotForm name fields: { first: "Salma", last: "Hassan" }
    const obj = value as Record<string, unknown>;
    if ("first" in obj || "last" in obj) {
      return [obj.first, obj.middle, obj.last].map(flatten).filter(Boolean).join(" ").trim();
    }
    // JotForm phone fields: { full: "(613) 555-0123" } or { phone: "..." }
    if ("full" in obj) return flatten(obj.full);
    if ("phone" in obj) return flatten(obj.phone);
    return Object.values(obj).map(flatten).filter(Boolean).join(" ");
  }
  return String(value);
}

function tryMatch(
  entries: Array<[string, unknown]>,
  aliases: string[]
): string | null {
  for (const alias of aliases) {
    for (const [key, value] of entries) {
      const norm = normalizeKey(key);
      if (norm === alias || norm.includes(alias)) {
        const flat = flatten(value);
        if (flat) return flat;
      }
    }
  }
  return null;
}

function findEmail(entries: Array<[string, unknown]>): string | null {
  for (const [, value] of entries) {
    const flat = flatten(value);
    if (EMAIL_RE.test(flat)) return flat;
  }
  return null;
}

function findPhone(entries: Array<[string, unknown]>, used: Set<string>): string | null {
  for (const [key, value] of entries) {
    const flat = flatten(value);
    if (used.has(flat)) continue;
    // Must look like a phone AND not be an email.
    if (PHONE_RE.test(flat) && !EMAIL_RE.test(flat) && /\d{3}/.test(flat)) {
      // Avoid catching age/year fields by requiring 7+ digits.
      const digits = flat.replace(/\D/g, "");
      if (digits.length >= 7) return flat;
    }
    // Also match by alias key in case the value is short.
    if (PARENT_PHONE_ALIASES.includes(normalizeKey(key))) {
      return flat;
    }
  }
  return null;
}

export function parseRawRequest(rawRequest: string | null | undefined): Record<string, unknown> {
  if (!rawRequest) return {};
  try {
    const parsed = JSON.parse(rawRequest);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

/**
 * Parse the multipart form-data body that JotForm POSTs to the webhook.
 * `body` is a plain `Record<string, string>` derived from `Object.fromEntries(formData)`.
 */
export function parseJotformWebhook(body: Record<string, string>): ParsedSubmission {
  const formId = body.formID ?? body.formId ?? "";
  const submissionId = body.submissionID ?? body.submissionId ?? "";

  const raw = parseRawRequest(body.rawRequest);
  // Merge the form-data shallow values too — JotForm sometimes sends fields at the top level.
  const merged: Record<string, unknown> = { ...body, ...raw };
  const entries = Object.entries(raw); // prefer the parsed JSON for extraction

  const parentName = tryMatch(entries, PARENT_NAME_ALIASES);
  const parentEmail = tryMatch(entries, PARENT_EMAIL_ALIASES) ?? findEmail(entries);
  const parentPhone =
    tryMatch(entries, PARENT_PHONE_ALIASES) ??
    findPhone(entries, new Set([parentEmail ?? ""]));

  const camperName = tryMatch(entries, CAMPER_NAME_ALIASES);
  const camperAgeRaw = tryMatch(entries, CAMPER_AGE_ALIASES);
  const camperAge = camperAgeRaw && /^\d+$/.test(camperAgeRaw) ? Number(camperAgeRaw) : camperAgeRaw;

  const campers: CamperInfo[] = camperName
    ? [{ name: camperName, age: camperAge ?? undefined }]
    : [];

  return {
    formId,
    submissionId,
    parentName,
    parentEmail,
    parentPhone,
    campers,
    rawPayload: merged
  };
}
