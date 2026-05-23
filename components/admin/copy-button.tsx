"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
  const [done, setDone] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
      setTimeout(() => setDone(false), 1400);
    } catch {
      // Older browsers — fall back to prompt so the user can copy by hand.
      // eslint-disable-next-line no-alert
      window.prompt("Copy this value:", value);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ??
        "inline-flex h-6 items-center gap-1 border border-line bg-paper px-1.5 text-[10px] uppercase tracking-[0.16em] text-ink-soft transition hover:border-pine hover:text-ink"
      }
    >
      {done ? <Check size={11} weight="bold" /> : <Copy size={11} weight="bold" />}
      {done ? "Copied" : label}
    </button>
  );
}
