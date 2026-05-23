import { NextResponse, type NextRequest } from "next/server";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import {
  exchangeCodeForTokens,
  fetchGoogleUserinfo,
  isGoogleOAuthConfigured,
  saveGmailCredentials
} from "@/lib/admin/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/gmail/oauth/callback
 *
 * Google redirects here after the owner consents. We:
 *  1. Validate the CSRF state cookie matches the ?state= param
 *  2. Exchange the auth code for access + refresh tokens
 *  3. Fetch the connected Gmail address (userinfo endpoint)
 *  4. Persist tokens in gmail_credentials
 *  5. Redirect back to /admin/setup/gmail with a flash message
 */
export async function GET(req: NextRequest) {
  await requireAuthorizedAdmin();
  const origin = getOrigin(req);

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      flashUrl(origin, "error", "Google OAuth is not configured.")
    );
  }

  const params = req.nextUrl.searchParams;
  const errorParam = params.get("error");
  if (errorParam) {
    return NextResponse.redirect(
      flashUrl(origin, "error", `Google returned an error: ${errorParam}`)
    );
  }

  const code = params.get("code");
  const state = params.get("state");
  const expectedState = req.cookies.get("gmail_oauth_state")?.value;

  if (!code) {
    return NextResponse.redirect(flashUrl(origin, "error", "Missing OAuth code."));
  }
  if (!state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(
      flashUrl(origin, "error", "OAuth state mismatch — start the connect flow again.")
    );
  }

  try {
    const tokens = await exchangeCodeForTokens(code, origin);
    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        flashUrl(
          origin,
          "error",
          "Google didn't return a refresh token. Re-try and click 'Continue' on the consent screen."
        )
      );
    }

    const userinfo = await fetchGoogleUserinfo(tokens.access_token);
    if (!userinfo.email) {
      return NextResponse.redirect(
        flashUrl(origin, "error", "Could not read your Gmail address from Google.")
      );
    }

    await saveGmailCredentials(userinfo.email, tokens);

    const res = NextResponse.redirect(
      flashUrl(origin, "success", `Connected Gmail account ${userinfo.email}.`)
    );
    res.cookies.delete("gmail_oauth_state");
    return res;
  } catch (err) {
    console.error("[gmail/oauth/callback] error:", err);
    return NextResponse.redirect(
      flashUrl(origin, "error", err instanceof Error ? err.message : "OAuth failed.")
    );
  }
}

function getOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "myo.camp";
  const proto =
    req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function flashUrl(origin: string, type: "success" | "error", message: string): string {
  const url = new URL("/admin/setup/gmail", origin);
  url.searchParams.set("type", type);
  url.searchParams.set("message", message);
  return url.toString();
}
