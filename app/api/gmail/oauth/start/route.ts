import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";

import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { buildGoogleAuthUrl, isGoogleOAuthConfigured } from "@/lib/admin/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/gmail/oauth/start
 *
 * Admin-only. Builds the Google consent URL and 302s to it. We set a CSRF
 * state cookie (httpOnly) that the callback route validates.
 */
export async function GET(req: NextRequest) {
  await requireAuthorizedAdmin();

  if (!isGoogleOAuthConfigured()) {
    return NextResponse.redirect(
      buildAdminRedirect(req, "error", "Google OAuth is not configured. Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET.")
    );
  }

  const origin = getOrigin(req);
  const state = randomBytes(24).toString("hex");
  const url = buildGoogleAuthUrl(origin, state);

  const res = NextResponse.redirect(url);
  res.cookies.set("gmail_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: origin.startsWith("https://"),
    path: "/",
    maxAge: 600 // 10 min
  });
  return res;
}

function getOrigin(req: NextRequest): string {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "myo.camp";
  const proto =
    req.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function buildAdminRedirect(req: NextRequest, type: "success" | "error", message: string): string {
  const origin = getOrigin(req);
  const url = new URL("/admin/setup/gmail", origin);
  url.searchParams.set("type", type);
  url.searchParams.set("message", message);
  return url.toString();
}
