/**
 * Interac e-Transfer notification email parser.
 *
 * Interac sends standardized HTML emails for two flows we care about:
 *   1. Auto-deposit completed (subject: "INTERAC e-Transfer: A money transfer
 *      of $X.XX (CAD) from NAME has been deposited.")
 *   2. New transfer awaiting acceptance (subject: "INTERAC e-Transfer from NAME").
 *
 * Both contain the amount, the sender's name, and (when set) the sender's memo.
 * Our reference codes look like `MYO-2026-A4F2`. If a parent put the code in
 * the memo, we auto-match. If not, the email lands in the triage queue.
 *
 * This parser is pure (no I/O), regex-only, and bank-agnostic — it relies on
 * Interac's own notification format, not the individual bank's emails.
 */

export interface ParsedEtransfer {
  isInteracNotification: boolean;
  isDeposit: boolean;             // true for auto-deposit completed emails
  amount: number | null;
  currency: string | null;
  senderName: string | null;
  senderEmail: string | null;
  memo: string | null;
  referenceCode: string | null;   // first MYO-YYYY-XXXX match found anywhere
}

/** Looks like `MYO-2026-A4F2` or `MYO-2026-A4F2Q`. Case-insensitive. */
export const MYO_REFERENCE_CODE_RE = /\bMYO[-\s]?(\d{4})[-\s]?([A-Z0-9]{4,6})\b/i;

/** Every MYO reference code found in a memo, subject, or body. */
export function extractAllReferenceCodes(haystack: string): string[] {
  const re = new RegExp(MYO_REFERENCE_CODE_RE.source, "gi");
  const codes = new Set<string>();
  for (const match of haystack.matchAll(re)) {
    if (match[1] && match[2]) {
      codes.add(`MYO-${match[1]}-${match[2].toUpperCase()}`);
    }
  }
  return [...codes];
}

const INTERAC_FROM_HINTS = [
  "payments.interac.ca",
  "interac.ca",
  "interac.notify",
  "notify@payments.interac.ca",
  "catch@payments.interac.ca"
];

const INTERAC_SUBJECT_HINTS = [
  "INTERAC e-Transfer",
  "Interac e-Transfer",
  "Interac eTransfer",
  "Virement Interac"
];

const DEPOSIT_HINTS = [
  "has been deposited",
  "Auto-Deposit",
  "Auto Deposit",
  "automatically deposited"
];

const AMOUNT_RE = /\$\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2}))\s*\(?([A-Z]{3})?\)?/;
const SENDER_FROM_HEADER_RE = /from\s+([A-Z][A-Za-z'\-\s.]+?)(?:\s+has been deposited|\s+sent you|\s+\(|\s+a\s+|\.|,)/i;
const SENDER_ALL_CAPS_RE = /\bfrom\s+([A-Z][A-Z\-\s']{2,})/;
const MEMO_LINE_RE = /(?:Message|Memo|Sender Message|Personal message|Note)\s*[:\-]\s*([^\n\r]{1,200})/i;
// Email-shaped pattern (basic), used to scrape the parent's email when the
// notification echoes it back ("from john@example.com").
const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

function normalizeWhitespace(text: string): string {
  return text.replace(/\u00a0/g, " ").replace(/\r\n/g, "\n");
}

function cleanSenderName(raw: string | null): string | null {
  if (!raw) return null;
  let s = raw.trim();
  // Drop stray trailing words like "has", "sent", noise.
  s = s.replace(/\s+(has|sent|on|to|a money)\b.*$/i, "").trim();
  // Collapse whitespace.
  s = s.replace(/\s+/g, " ").trim();
  // Title-case all-caps names — "SAMIR ABDELRAHMAN" → "Samir Abdelrahman".
  if (s && s === s.toUpperCase()) {
    s = s
      .toLowerCase()
      .split(" ")
      .map((p) => (p.length > 0 ? p[0].toUpperCase() + p.slice(1) : p))
      .join(" ");
  }
  return s || null;
}

export interface ParseInput {
  fromHeader: string | null;
  subject: string | null;
  bodyText: string;
}

export function parseInteracNotification(input: ParseInput): ParsedEtransfer {
  const fromHeader = (input.fromHeader ?? "").toLowerCase();
  const subject = input.subject ?? "";
  const text = normalizeWhitespace(input.bodyText ?? "");
  const subjectLower = subject.toLowerCase();

  const looksLikeInterac =
    INTERAC_FROM_HINTS.some((hint) => fromHeader.includes(hint)) ||
    INTERAC_SUBJECT_HINTS.some((hint) => subject.includes(hint));

  if (!looksLikeInterac) {
    return {
      isInteracNotification: false,
      isDeposit: false,
      amount: null,
      currency: null,
      senderName: null,
      senderEmail: null,
      memo: null,
      referenceCode: null
    };
  }

  // Amount — prefer the one near the keyword "money transfer" in the subject,
  // else first dollar amount in the body.
  let amount: number | null = null;
  let currency: string | null = null;
  const subjectAmount = subject.match(AMOUNT_RE);
  if (subjectAmount) {
    amount = Number(subjectAmount[1].replace(/,/g, ""));
    currency = subjectAmount[2] ?? "CAD";
  } else {
    const bodyAmount = text.match(AMOUNT_RE);
    if (bodyAmount) {
      amount = Number(bodyAmount[1].replace(/,/g, ""));
      currency = bodyAmount[2] ?? "CAD";
    }
  }

  // Sender — try the structured "from NAME" pattern in subject first, then body.
  let senderName: string | null = null;
  const subjectMatch =
    subject.match(SENDER_FROM_HEADER_RE) ?? subject.match(SENDER_ALL_CAPS_RE);
  if (subjectMatch) senderName = cleanSenderName(subjectMatch[1]);
  if (!senderName) {
    const bodyMatch = text.match(SENDER_FROM_HEADER_RE) ?? text.match(SENDER_ALL_CAPS_RE);
    if (bodyMatch) senderName = cleanSenderName(bodyMatch[1]);
  }

  // Sender email — Interac echoes the sender's email a couple of lines into
  // the body. We pick the first email that isn't an Interac address.
  let senderEmail: string | null = null;
  const emailMatches = text.match(new RegExp(EMAIL_RE.source, "gi")) ?? [];
  for (const candidate of emailMatches) {
    const lower = candidate.toLowerCase();
    if (lower.endsWith("interac.ca") || lower.includes("payments.interac")) continue;
    senderEmail = candidate;
    break;
  }

  // Memo / message
  const memoMatch = text.match(MEMO_LINE_RE);
  const memo = memoMatch ? memoMatch[1].trim() : null;

  // Reference code — search ANYWHERE (memo, subject, body), case-insensitive.
  const haystack = `${subject}\n${text}`;
  const refMatch = haystack.match(MYO_REFERENCE_CODE_RE);
  const referenceCode = refMatch
    ? `MYO-${refMatch[1]}-${refMatch[2].toUpperCase()}`
    : null;

  const isDeposit = DEPOSIT_HINTS.some((hint) => subjectLower.includes(hint.toLowerCase()) || text.toLowerCase().includes(hint.toLowerCase()));

  return {
    isInteracNotification: true,
    isDeposit,
    amount,
    currency,
    senderName,
    senderEmail,
    memo,
    referenceCode
  };
}
