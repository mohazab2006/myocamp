import "server-only";

/**
 * Minimal Resend client. Zero deps — Resend's REST API is one POST.
 *
 * Required env vars:
 *   RESEND_API_KEY        Server-only API key from https://resend.com/api-keys
 *   EMAIL_FROM_ADDRESS    e.g. "MYO Camp <camp@myo.camp>"
 *
 * Optional:
 *   EMAIL_REPLY_TO        Defaults to the From address.
 */

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM_ADDRESS);
}

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string | null;
  from?: string | null;
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  id: string | null;
  error: string | null;
}

/**
 * Send a transactional email via Resend. Returns the provider id on success,
 * an error message on failure. Never throws — call sites should log + continue.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    return { id: null, error: "Resend is not configured (RESEND_API_KEY + EMAIL_FROM_ADDRESS)." };
  }
  const apiKey = process.env.RESEND_API_KEY!;
  const from = input.from ?? process.env.EMAIL_FROM_ADDRESS!;
  const replyTo = input.replyTo ?? process.env.EMAIL_REPLY_TO ?? undefined;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      cache: "no-store",
      body: JSON.stringify({
        from,
        to: Array.isArray(input.to) ? input.to : [input.to],
        subject: input.subject,
        html: input.html,
        text: input.text,
        reply_to: replyTo,
        tags: input.tags
      })
    });
    const json = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    if (!res.ok) {
      return { id: null, error: json.message ?? `Resend returned ${res.status}` };
    }
    return { id: json.id ?? null, error: null };
  } catch (err) {
    return {
      id: null,
      error: err instanceof Error ? err.message : "Unknown error sending email."
    };
  }
}
