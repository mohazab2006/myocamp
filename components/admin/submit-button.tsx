"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { CircleNotch } from "@phosphor-icons/react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type AdminSubmitButtonProps = {
  idleLabel: ReactNode;
  pendingLabel?: ReactNode;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  icon?: ReactNode;
};

const baseClass =
  "inline-flex h-11 items-center justify-center gap-2 px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-paper hover:bg-pine",
  secondary: "border border-line bg-paper text-ink hover:border-pine hover:text-forest",
  danger: "border border-ember/40 bg-ember/10 text-ember hover:bg-ember/20",
  ghost: "text-ink-soft hover:text-ink"
};

export function AdminSubmitButton({
  idleLabel,
  pendingLabel,
  variant = "primary",
  className,
  disabled = false,
  icon
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isBusy = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isBusy}
      className={`${baseClass} ${variants[variant]} ${className ?? ""}`.trim()}
      aria-busy={pending || undefined}
    >
      {pending ? (
        <>
          <CircleNotch size={16} weight="bold" className="animate-spin" />
          {pendingLabel ?? "Saving…"}
        </>
      ) : (
        <>
          {icon}
          {idleLabel}
        </>
      )}
    </button>
  );
}
