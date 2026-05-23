import type { ReactNode } from "react";

type AdminFieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/**
 * Labelled form row used across the admin. Bold label + optional hint
 * explaining where the value shows up on the public site.
 */
export function AdminField({ label, hint, required, children, className }: AdminFieldProps) {
  return (
    <label className={`grid gap-2 text-sm text-ink-soft ${className ?? ""}`.trim()}>
      <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {label}
        {required ? <span className="text-[10px] font-normal text-ember">required</span> : null}
      </span>
      {hint ? <span className="text-xs leading-relaxed text-ink-soft">{hint}</span> : null}
      {children}
    </label>
  );
}

export const adminInputClass =
  "min-h-11 w-full border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition focus:border-pine disabled:cursor-not-allowed disabled:opacity-60";

export const adminTextareaClass =
  "min-h-28 w-full border border-line bg-paper px-3 py-2 text-sm leading-relaxed text-ink outline-none transition focus:border-pine disabled:cursor-not-allowed disabled:opacity-60";
