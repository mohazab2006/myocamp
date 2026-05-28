"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, CircleNotch, Warning } from "@phosphor-icons/react";

type ReadyRegistration = {
  status: "ready";
  kind: "registration";
  campTitle: string;
  referenceCode: string;
  paymentUrl: string;
};

type ReadyWaitlist = {
  status: "ready";
  kind: "waitlist";
  campTitle: string;
  position: number;
  registerUrl: string;
};

type PollState =
  | { phase: "loading" }
  | { phase: "ready"; data: ReadyRegistration | ReadyWaitlist }
  | { phase: "timeout" }
  | { phase: "error"; message: string };

const POLL_MS = 800;
const MAX_ATTEMPTS = 25;

export function RegistrationCompletePoller({
  submissionId,
  campTitle
}: {
  submissionId: string;
  campTitle: string;
}) {
  const [state, setState] = useState<PollState>({ phase: "loading" });

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

          if (json.status === "ready" && json.kind === "registration" && json.paymentUrl) {
            window.location.replace(json.paymentUrl);
            if (!cancelled) {
              setState({
                phase: "ready",
                data: {
                  status: "ready",
                  kind: "registration",
                  campTitle: json.campTitle ?? campTitle,
                  referenceCode: json.referenceCode ?? "",
                  paymentUrl: json.paymentUrl
                }
              });
            }
            return;
          }

          if (json.status === "ready" && json.kind === "waitlist") {
            if (!cancelled) {
              setState({
                phase: "ready",
                data: {
                  status: "ready",
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
          // keep polling — webhook may still be in flight
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

  if (state.phase === "loading") {
    return (
      <div className="mx-auto max-w-xl border-2 border-camp-bark/30 bg-camp-paper p-10 text-center">
        <CircleNotch size={40} weight="bold" className="mx-auto animate-spin text-camp-flame" />
        <h1 className="font-camp mt-6 text-3xl text-camp-bark">Finishing your registration…</h1>
        <p className="mt-3 text-camp-ink/80">
          Hang tight — we&apos;re setting up your payment page for <strong>{campTitle}</strong>.
        </p>
      </div>
    );
  }

  if (state.phase === "ready" && state.data.kind === "registration") {
    return (
      <div className="mx-auto max-w-xl border-2 border-camp-bark/30 bg-camp-paper p-10 text-center">
        <h1 className="font-camp text-3xl text-camp-bark">Taking you to payment…</h1>
        <p className="mt-3 text-camp-ink/80">
          Reference <span className="font-mono text-camp-flame">{state.data.referenceCode}</span>
        </p>
        <a
          href={state.data.paymentUrl}
          className="mt-6 inline-flex items-center gap-2 font-camp text-xl text-camp-flame underline decoration-2 underline-offset-4"
        >
          Continue to payment <ArrowRight size={18} weight="bold" />
        </a>
      </div>
    );
  }

  if (state.phase === "ready" && state.data.kind === "waitlist") {
    return (
      <div className="mx-auto max-w-xl border-2 border-camp-bark/30 bg-camp-paper p-10 text-center">
        <h1 className="font-camp text-3xl text-camp-bark">You&apos;re on the waitlist</h1>
        <p className="mt-3 text-camp-ink/80">
          Thanks for signing up for <strong>{state.data.campTitle}</strong>. You&apos;re{" "}
          <strong>#{state.data.position}</strong> on the list — we&apos;ll email you if a spot opens.
        </p>
        <Link
          href={state.data.registerUrl}
          className="mt-6 inline-block font-camp text-xl text-camp-flame underline decoration-2 underline-offset-4"
        >
          Back to camp page
        </Link>
      </div>
    );
  }

  if (state.phase === "timeout") {
    return (
      <div className="mx-auto max-w-xl border-2 border-camp-flame/50 bg-camp-paper p-10 text-center">
        <Warning size={36} weight="duotone" className="mx-auto text-camp-flame" />
        <h1 className="font-camp mt-4 text-3xl text-camp-bark">Still processing</h1>
        <p className="mt-3 text-camp-ink/80">
          Your form was submitted, but payment isn&apos;t ready yet. Refresh in a minute, or check
          your email for a confirmation with your reference code.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block font-camp text-xl text-camp-flame underline decoration-2 underline-offset-4"
        >
          Contact us
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl border-2 border-camp-flame/50 bg-camp-paper p-10 text-center">
      <Warning size={36} weight="duotone" className="mx-auto text-camp-flame" />
      <h1 className="font-camp mt-4 text-3xl text-camp-bark">Couldn&apos;t load payment</h1>
      <p className="mt-3 text-camp-ink/80">{state.phase === "error" ? state.message : ""}</p>
      <Link
        href="/contact"
        className="mt-6 inline-block font-camp text-xl text-camp-flame underline decoration-2 underline-offset-4"
      >
        Contact us
      </Link>
    </div>
  );
}
