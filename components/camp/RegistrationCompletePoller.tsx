"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  CircleNotch,
  Confetti,
  Warning
} from "@phosphor-icons/react";

type ReadyRegistration = {
  kind: "registration";
  campTitle: string;
  parentName: string | null;
  camperName: string | null;
  referenceCode: string;
  amountDue: number;
  paymentUrl: string;
};

type ReadyWaitlist = {
  kind: "waitlist";
  campTitle: string;
  position: number;
  registerUrl: string;
};

type PollState =
  | { phase: "confirming" }
  | { phase: "confirmed"; data: ReadyRegistration }
  | { phase: "waitlist"; data: ReadyWaitlist }
  | { phase: "timeout" }
  | { phase: "error"; message: string };

const POLL_MS = 800;
const MAX_ATTEMPTS = 25;
const AUTO_PAY_REDIRECT_SEC = 6;

function formatCad(amount: number) {
  return amount.toLocaleString("en-CA", { style: "currency", currency: "CAD" });
}

function greetingName(parentName: string | null): string {
  if (!parentName?.trim()) return "there";
  const first = parentName.trim().split(/\s+/)[0];
  return first || "there";
}

function ThankYouShell({
  campTitle,
  children
}: {
  campTitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-camp-moss/50 bg-camp-moss/15">
        <CheckCircle size={36} weight="duotone" className="text-camp-moss" />
      </div>
      <p className="font-script mt-5 text-2xl text-camp-flame">you&apos;re in</p>
      <h1 className="font-camp mt-1 text-4xl leading-tight text-camp-bark md:text-5xl">
        Thank you for registering!
      </h1>
      <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-camp-ink/85">
        We&apos;ve received your registration for{" "}
        <strong className="text-camp-bark">{campTitle}</strong>. Your spot is reserved — you&apos;re
        all good on our end.
      </p>
      <div className="mt-8 border-2 border-camp-bark/25 bg-camp-paper p-6 text-left md:p-8">
        {children}
      </div>
    </div>
  );
}

export function RegistrationCompletePoller({
  submissionId,
  campTitle
}: {
  submissionId: string;
  campTitle: string;
}) {
  const [state, setState] = useState<PollState>({ phase: "confirming" });
  const [displayCampTitle, setDisplayCampTitle] = useState(campTitle);
  const [redirectIn, setRedirectIn] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    async function poll() {
      while (!cancelled && attempts < MAX_ATTEMPTS) {
        attempts += 1;
        try {
          const res = await fetch(
            `/api/registration/complete?sid=${encodeURIComponent(submissionId)}`,
            { cache: "no-store" }
          );
          const json = (await res.json()) as {
            ok?: boolean;
            status?: string;
            kind?: string;
            paymentUrl?: string;
            referenceCode?: string;
            campTitle?: string;
            parentName?: string | null;
            camperName?: string | null;
            amountDue?: number;
            position?: number;
            registerUrl?: string;
            error?: string;
          };

          if (!res.ok || !json.ok) {
            if (!cancelled) {
              setState({
                phase: "error",
                message: json.error ?? "Something went wrong. Please contact us."
              });
            }
            return;
          }

          if (json.campTitle) setDisplayCampTitle(json.campTitle);

          if (json.status === "ready" && json.kind === "registration" && json.paymentUrl) {
            if (!cancelled) {
              setState({
                phase: "confirmed",
                data: {
                  kind: "registration",
                  campTitle: json.campTitle ?? campTitle,
                  parentName: json.parentName ?? null,
                  camperName: json.camperName ?? null,
                  referenceCode: json.referenceCode ?? "",
                  amountDue: json.amountDue ?? 0,
                  paymentUrl: json.paymentUrl
                }
              });
            }
            return;
          }

          if (json.status === "ready" && json.kind === "waitlist") {
            if (!cancelled) {
              setState({
                phase: "waitlist",
                data: {
                  kind: "waitlist",
                  campTitle: json.campTitle ?? campTitle,
                  position: json.position ?? 0,
                  registerUrl: json.registerUrl ?? "/camp/register"
                }
              });
            }
            return;
          }
        } catch {
          // webhook may still be in flight
        }

        await new Promise((r) => setTimeout(r, POLL_MS));
      }

      if (!cancelled) setState({ phase: "timeout" });
    }

    void poll();
    return () => {
      cancelled = true;
    };
  }, [submissionId, campTitle]);

  useEffect(() => {
    if (state.phase !== "confirmed") return;

    const paymentUrl = state.data.paymentUrl;
    setRedirectIn(AUTO_PAY_REDIRECT_SEC);

    const tick = window.setInterval(() => {
      setRedirectIn((n) => {
        if (n === null || n <= 1) {
          window.clearInterval(tick);
          window.location.href = paymentUrl;
          return 0;
        }
        return n - 1;
      });
    }, 1000);

    return () => window.clearInterval(tick);
  }, [state]);

  if (state.phase === "confirming") {
    return (
      <ThankYouShell campTitle={displayCampTitle}>
        <div className="flex flex-col items-center gap-3 text-center">
          <CircleNotch size={28} weight="bold" className="animate-spin text-camp-flame" />
          <p className="font-camp text-xl text-camp-bark">Almost done…</p>
          <p className="text-sm leading-relaxed text-camp-ink/75">
            We&apos;re generating your reference code and payment link. This usually takes just a
            few seconds.
          </p>
        </div>
      </ThankYouShell>
    );
  }

  if (state.phase === "confirmed") {
    const { data } = state;
    return (
      <ThankYouShell campTitle={data.campTitle}>
        <div className="space-y-5 text-center">
          <div className="flex items-center justify-center gap-2 text-camp-moss">
            <Confetti size={22} weight="duotone" />
            <p className="font-camp text-xl text-camp-bark">
              Hi {greetingName(data.parentName)} — you&apos;re registered!
            </p>
          </div>

          {data.camperName ? (
            <p className="text-sm text-camp-ink/80">
              Camper: <strong className="text-camp-bark">{data.camperName}</strong>
            </p>
          ) : null}

          <div className="border border-dashed border-camp-bark/35 bg-camp-paper-soft px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-camp-ink/60">
              Your reference code
            </p>
            <p className="font-mono mt-1 text-2xl tracking-wide text-camp-flame">
              {data.referenceCode}
            </p>
            {data.amountDue > 0 ? (
              <p className="mt-1 text-sm text-camp-ink/75">
                Amount due: <strong>{formatCad(data.amountDue)}</strong>
              </p>
            ) : null}
          </div>

          <p className="text-sm leading-relaxed text-camp-ink/80">
            <strong className="text-camp-bark">One last step:</strong> complete payment to lock in
            your spot. Save your reference code — you&apos;ll need it for e-Transfer.
          </p>

          <a
            href={data.paymentUrl}
            className="inline-flex w-full items-center justify-center gap-2 border-2 border-camp-flame bg-camp-flame px-5 py-3.5 font-camp text-xl text-camp-paper transition hover:bg-camp-bark hover:border-camp-bark"
          >
            Continue to payment <ArrowRight size={20} weight="bold" />
          </a>

          {redirectIn !== null && redirectIn > 0 ? (
            <p className="text-xs text-camp-ink/60">
              Redirecting to payment in {redirectIn} second{redirectIn === 1 ? "" : "s"}…
            </p>
          ) : null}
        </div>
      </ThankYouShell>
    );
  }

  if (state.phase === "waitlist") {
    const { data } = state;
    return (
      <ThankYouShell campTitle={data.campTitle}>
        <div className="space-y-4 text-center">
          <CheckCircle size={40} weight="fill" className="mx-auto text-camp-flame" />
          <p className="font-camp text-xl text-camp-bark">You&apos;re on the waitlist</p>
          <p className="text-sm leading-relaxed text-camp-ink/80">
            Thanks for signing up. This session is full right now — you&apos;re{" "}
            <strong className="text-camp-bark">#{data.position}</strong> on the waitlist. If a spot
            opens up, we&apos;ll email you with a link to register. No need to check back; we&apos;ll
            reach out when it&apos;s your turn.
          </p>
          <Link
            href={data.registerUrl}
            className="inline-block font-camp text-lg text-camp-flame underline decoration-2 underline-offset-4"
          >
            Back to camp page
          </Link>
        </div>
      </ThankYouShell>
    );
  }

  if (state.phase === "timeout") {
    return (
      <ThankYouShell campTitle={displayCampTitle}>
        <div className="space-y-4 text-center">
          <Warning size={32} weight="duotone" className="mx-auto text-camp-flame" />
          <p className="font-camp text-xl text-camp-bark">Registration received</p>
          <p className="text-sm leading-relaxed text-camp-ink/80">
            Your form went through — we&apos;re still finishing the payment link on our side. Check
            your email shortly, or refresh this page in a minute.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="font-camp text-lg text-camp-flame underline decoration-2 underline-offset-4"
          >
            Refresh this page
          </button>
          <Link
            href="/contact"
            className="block text-sm text-camp-ink/70 underline underline-offset-2 hover:text-camp-bark"
          >
            Contact us if you need help
          </Link>
        </div>
      </ThankYouShell>
    );
  }

  return (
    <ThankYouShell campTitle={displayCampTitle}>
      <div className="space-y-4 text-center">
        <Warning size={32} weight="duotone" className="mx-auto text-camp-flame" />
        <p className="text-sm leading-relaxed text-camp-ink/80">
          {state.phase === "error" ? state.message : "Something went wrong."}
        </p>
        <Link
          href="/contact"
          className="inline-block font-camp text-lg text-camp-flame underline decoration-2 underline-offset-4"
        >
          Contact us
        </Link>
      </div>
    </ThankYouShell>
  );
}
