import Link from "next/link";
import type { ComponentProps } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-forest text-paper hover:bg-pine border border-forest hover:border-pine",
  secondary:
    "bg-transparent text-ink border border-ink/20 hover:border-ink hover:bg-ink/5",
  ghost:
    "bg-transparent text-ink border border-transparent hover:bg-ink/5"
};

interface BaseProps {
  variant?: Variant;
  withArrow?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLink({
  href,
  variant = "primary",
  withArrow = true,
  children,
  className = "",
  ...rest
}: BaseProps & ComponentProps<typeof Link>) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition active:translate-y-[1px] ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
      {withArrow && <ArrowUpRight size={14} weight="bold" />}
    </Link>
  );
}

export function ButtonAnchor({
  href,
  variant = "primary",
  withArrow = true,
  children,
  className = "",
  ...rest
}: BaseProps & ComponentProps<"a">) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition active:translate-y-[1px] ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
      {withArrow && <ArrowUpRight size={14} weight="bold" />}
    </a>
  );
}
