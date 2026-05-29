import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

import { acceptWaitlistClaim } from "@/lib/admin/accept-waitlist-claim";
import { fetchCampBySlug } from "@/lib/admin/camps";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/waitlist/accept-claim
 * Body: { slug: string, token: string, camperName?: string }
 *
 * Called only when the parent clicks "Confirm my spot" (not from email link GET).
 */
export async function POST(req: NextRequest) {
  let body: { slug?: string; token?: string; camperName?: string };
  try {
    body = (await req.json()) as { slug?: string; token?: string; camperName?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = body.slug?.trim();
  const token = body.token?.trim();
  if (!slug || !token) {
    return NextResponse.json({ ok: false, error: "Missing slug or token" }, { status: 400 });
  }

  const result = await acceptWaitlistClaim({
    slug,
    token,
    camperName: body.camperName?.trim() ?? null,
    origin: req.nextUrl.origin
  });

  if (!result.ok) {
    const status =
      result.status === "invalid" ? 404 : result.status === "expired" ? 410 : 409;
    return NextResponse.json(
      { ok: false, status: result.status, error: result.message },
      { status: result.status === "error" ? 500 : status }
    );
  }

  const camp = await fetchCampBySlug(slug);
  if (camp && !result.alreadyClaimed) {
    revalidatePath(`/admin/camps/${camp.slug}`);
    revalidatePath("/admin/camps");
  }

  return NextResponse.json({
    ok: true,
    referenceCode: result.referenceCode,
    paymentUrl: result.paymentUrl,
    alreadyClaimed: result.alreadyClaimed ?? false
  });
}
