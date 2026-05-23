"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface PayPalButtonProps {
  referenceCode: string;
  clientId: string;
  amount: number;
  currency?: string;
  environment?: "sandbox" | "live";
}

type PayPalSDK = {
  Buttons: (config: {
    style?: Record<string, unknown>;
    createOrder: () => Promise<string>;
    onApprove: (data: { orderID: string }) => Promise<void>;
    onError: (err: unknown) => void;
    onCancel?: () => void;
  }) => { render: (selector: string | HTMLElement) => Promise<void> };
};

declare global {
  interface Window {
    paypal?: PayPalSDK;
  }
}

export function PayPalButton({
  referenceCode,
  clientId,
  amount,
  currency = "CAD"
}: PayPalButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [phase, setPhase] = useState<"loading" | "ready" | "processing" | "done" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSdk() {
      if (typeof window === "undefined") return;

      if (!window.paypal) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>('script[data-paypal-sdk="true"]');
          if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () => reject(new Error("PayPal SDK failed to load.")));
            if (window.paypal) resolve();
            return;
          }
          const script = document.createElement("script");
          const sdkUrl =
            `https://www.paypal.com/sdk/js?` +
            new URLSearchParams({
              "client-id": clientId,
              currency,
              intent: "capture",
              "disable-funding": "credit,card"
            }).toString();
          script.src = sdkUrl;
          script.async = true;
          script.dataset.paypalSdk = "true";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("PayPal SDK failed to load."));
          document.head.appendChild(script);
        });
      }

      if (cancelled) return;
      if (!window.paypal || !containerRef.current) {
        throw new Error("PayPal SDK loaded but window.paypal is missing.");
      }
      if (renderedRef.current) return;
      renderedRef.current = true;

      await window.paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "pay" },
          createOrder: async () => {
            setPhase("processing");
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ref: referenceCode })
            });
            const json = await res.json();
            if (!res.ok || !json.id) {
              setPhase("error");
              setErrorMessage(json.error ?? "Could not start PayPal checkout.");
              throw new Error(json.error ?? "Could not start PayPal checkout.");
            }
            return json.id as string;
          },
          onApprove: async (data) => {
            setPhase("processing");
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID, ref: referenceCode })
            });
            const json = await res.json();
            if (!res.ok || !json.ok) {
              setPhase("error");
              setErrorMessage(json.error ?? "Payment could not be confirmed.");
              return;
            }
            setPhase("done");
            // Force a fresh server render so the page now shows "Paid".
            router.refresh();
          },
          onError: (err) => {
            setPhase("error");
            setErrorMessage(err instanceof Error ? err.message : "PayPal returned an error.");
          },
          onCancel: () => {
            setPhase("ready");
            setErrorMessage(null);
          }
        })
        .render(containerRef.current);

      if (!cancelled) setPhase("ready");
    }

    loadSdk().catch((err) => {
      if (cancelled) return;
      setPhase("error");
      setErrorMessage(err instanceof Error ? err.message : "Could not load PayPal.");
    });

    return () => {
      cancelled = true;
    };
  }, [clientId, currency, referenceCode, router]);

  return (
    <div className="space-y-3">
      <div className="border border-line bg-paper p-4">
        <div ref={containerRef} className="min-h-[44px]" />
        {phase === "loading" ? (
          <p className="text-center text-xs text-ink-soft">Loading PayPal…</p>
        ) : null}
        {phase === "processing" ? (
          <p className="text-center text-xs text-ink-soft">Processing — please wait…</p>
        ) : null}
        {phase === "done" ? (
          <p className="text-center text-xs font-semibold text-forest">
            Payment confirmed. Refreshing…
          </p>
        ) : null}
      </div>
      {errorMessage ? (
        <p className="border border-ember/40 bg-ember/10 px-3 py-2 text-xs text-ember">
          {errorMessage}
        </p>
      ) : null}
      <p className="text-center text-[11px] text-ink-soft">
        You'll be charged {currency} ${amount.toFixed(2)}. PayPal handles the transaction
        securely.
      </p>
    </div>
  );
}
