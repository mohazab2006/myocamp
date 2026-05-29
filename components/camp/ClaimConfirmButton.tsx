"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, Warning } from "@phosphor-icons/react";

type Phase = "idle" | "working" | "error";

export function ClaimConfirmButton({
  slug,
  token,
  showCamperNameField
}: {
  slug: string;
  token: string;
  showCamperNameField: boolean;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [camperName, setCamperName] = useState("");

  async function onConfirm() {
    setPhase("working");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/waitlist/accept-claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          token,
          camperName: showCamperNameField ? camperName.trim() || undefined : undefined
        })
      });
      const json = (await res.json()) as {
        ok?: boolean;
        paymentUrl?: string;
        error?: string;
        alreadyClaimed?: boolean;
      };

      if (!res.ok || !json.ok || !json.paymentUrl) {
        setPhase("error");
        setErrorMessage(json.error ?? "Could not confirm your spot. Try again or contact us.");
        return;
      }

      window.location.href = json.paymentUrl;
    } catch {
      setPhase("error");
      setErrorMessage("Network error — check your connection and try again.");
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {showCamperNameField ? (
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
            Camper name (optional — you can edit later)
          </span>
          <input
            name="camperName"
            value={camperName}
            onChange={(e) => setCamperName(e.target.value)}
            className="min-h-11 w-full border border-line bg-paper px-3 py-2 text-sm"
            placeholder="e.g. Salma Hassan"
          />
        </label>
      ) : null}
      <button
        type="button"
        onClick={() => void onConfirm()}
        disabled={phase === "working"}
        className="inline-flex h-11 items-center gap-2 bg-forest px-5 text-sm font-semibold text-paper transition hover:bg-pine disabled:opacity-60"
      >
        <CheckCircle size={16} weight="bold" />
        {phase === "working" ? "Confirming…" : "Confirm my spot"}
        <ArrowRight size={16} weight="bold" />
      </button>
      {errorMessage ? (
        <p className="flex items-start gap-2 border border-ember/40 bg-ember/10 px-3 py-2 text-xs text-ember">
          <Warning size={14} weight="bold" className="mt-0.5 shrink-0" />
          {errorMessage}
        </p>
      ) : null}
      <p className="text-xs leading-relaxed text-ink-soft">
        By confirming you agree to pay the registration fee on the next screen (PayPal,
        e-Transfer, or cash at drop-off).
      </p>
    </div>
  );
}
