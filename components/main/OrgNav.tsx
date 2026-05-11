"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";
import { Flame, List, X } from "@phosphor-icons/react/ssr";

const items = [
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blog" },
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" }
];

export function OrgNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/") return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
        <Link
          href="/"
          aria-label="MYO home"
          onClick={handleHomeClick}
          className="group -ml-2 inline-flex items-center gap-3 rounded-2xl px-2 py-1.5 transition hover:bg-ink/5 active:translate-y-[1px] md:gap-4 md:px-3"
        >
          <span className="relative inline-flex h-12 w-12 items-center justify-center md:h-14 md:w-14">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-pine/10 opacity-0 transition group-hover:opacity-100"
            />
            <img
              src="/Pictures/LogoMAIN.png"
              alt=""
              className="relative h-11 w-11 object-contain transition group-hover:scale-[1.06] md:h-12 md:w-12"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(17%) sepia(18%) saturate(1100%) hue-rotate(95deg) brightness(95%) contrast(94%)"
              }}
            />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-base font-medium tracking-tight text-ink transition group-hover:text-pine md:text-lg">
              Muslim Youth of Ottawa
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-ink-soft md:text-[11px]">
              Volunteer-run &middot; est. 1980s
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-ink/8 text-ink"
                    : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/camp"
            className={`ml-3 inline-flex items-center gap-2 rounded-full bg-ember px-4 py-2 text-sm font-medium text-paper shadow-[0_1px_0_oklch(22%_0.018_132)] transition hover:translate-y-[-1px] active:translate-y-0 ${
              pathname?.startsWith("/camp") ? "ring-2 ring-ink/15 ring-offset-2 ring-offset-paper" : ""
            }`}
          >
            <Flame size={14} weight="fill" />
            The Camp
          </Link>
        </nav>

        <button
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-ink transition hover:bg-ink/5 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper md:hidden">
          <nav className="mx-auto flex max-w-[1320px] flex-col px-4 py-3">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-3 text-base font-medium transition ${
                    active ? "bg-ink/8 text-ink" : "text-ink-soft hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/camp"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-ember px-4 py-3 text-sm font-medium text-paper"
            >
              <Flame size={14} weight="fill" />
              The Camp
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
