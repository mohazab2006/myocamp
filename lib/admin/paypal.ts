import "server-only";

/**
 * Minimal PayPal Orders v2 client. Zero dependencies — uses fetch + raw REST.
 *
 * Required env vars:
 *   - NEXT_PUBLIC_PAYPAL_CLIENT_ID   (public, used by the browser SDK)
 *   - PAYPAL_CLIENT_SECRET           (server-only)
 *   - PAYPAL_ENVIRONMENT             "sandbox" (default) or "live"
 *
 * Docs:
 *   - https://developer.paypal.com/docs/api/orders/v2/
 *   - https://developer.paypal.com/api/rest/authentication/
 */

export type PayPalEnvironment = "sandbox" | "live";

export interface PayPalAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  app_id?: string;
  nonce?: string;
}

export interface PayPalCreateOrderResponse {
  id: string;
  status: string;
  links?: Array<{ href: string; rel: string; method: string }>;
}

export interface PayPalCaptureResponse {
  id: string;
  status: string;
  payer?: {
    name?: { given_name?: string; surname?: string };
    email_address?: string;
    payer_id?: string;
  };
  purchase_units?: Array<{
    reference_id?: string;
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: { currency_code: string; value: string };
        create_time: string;
        update_time: string;
      }>;
    };
  }>;
}

export function getPayPalEnvironment(): PayPalEnvironment {
  const v = (process.env.PAYPAL_ENVIRONMENT ?? "sandbox").toLowerCase();
  return v === "live" ? "live" : "sandbox";
}

export function getPayPalApiBase(): string {
  return getPayPalEnvironment() === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

export function isPayPalConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
  );
}

function requireCreds(): { clientId: string; clientSecret: string } {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      "PayPal not configured. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET."
    );
  }
  return { clientId, clientSecret };
}

// ---------------------------------------------------------------------------
// Access token (cached in-process for the lifetime of one request burst)
// ---------------------------------------------------------------------------

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 30_000) {
    return tokenCache.token;
  }

  const { clientId, clientSecret } = requireCreds();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const res = await fetch(`${getPayPalApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials",
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as PayPalAccessToken;
  tokenCache = {
    token: json.access_token,
    expiresAt: now + json.expires_in * 1000
  };
  return json.access_token;
}

// ---------------------------------------------------------------------------
// Create order
// ---------------------------------------------------------------------------

export interface CreateOrderInput {
  amount: number;
  currency?: string;
  referenceId: string; // our invoice reference code
  description?: string;
  payeeEmail?: string | null; // optional: route funds to a specific PayPal-merchant email
}

export async function createPayPalOrder(
  input: CreateOrderInput
): Promise<PayPalCreateOrderResponse> {
  const token = await getPayPalAccessToken();
  const currency = input.currency ?? "CAD";

  const purchaseUnit: Record<string, unknown> = {
    reference_id: input.referenceId,
    description: input.description ?? `MYO Camp registration ${input.referenceId}`,
    amount: {
      currency_code: currency,
      value: input.amount.toFixed(2)
    },
    custom_id: input.referenceId,
    invoice_id: input.referenceId
  };

  if (input.payeeEmail) {
    purchaseUnit.payee = { email_address: input.payeeEmail };
  }

  const res = await fetch(`${getPayPalApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `myo-${input.referenceId}-${Date.now()}`
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [purchaseUnit]
    }),
    cache: "no-store"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal create order failed (${res.status}): ${text}`);
  }
  return (await res.json()) as PayPalCreateOrderResponse;
}

// ---------------------------------------------------------------------------
// Capture order
// ---------------------------------------------------------------------------

export async function capturePayPalOrder(orderId: string): Promise<PayPalCaptureResponse> {
  const token = await getPayPalAccessToken();

  const res = await fetch(
    `${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `myo-cap-${orderId}-${Date.now()}`
      },
      body: "{}",
      cache: "no-store"
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal capture failed (${res.status}): ${text}`);
  }
  return (await res.json()) as PayPalCaptureResponse;
}

// ---------------------------------------------------------------------------
// Look up an order (useful for the capture flow to re-verify amount/reference)
// ---------------------------------------------------------------------------

export async function getPayPalOrder(orderId: string): Promise<Record<string, unknown>> {
  const token = await getPayPalAccessToken();
  const res = await fetch(
    `${getPayPalApiBase()}/v2/checkout/orders/${encodeURIComponent(orderId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal get order failed (${res.status}): ${text}`);
  }
  return (await res.json()) as Record<string, unknown>;
}
