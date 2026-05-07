"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Flame, List, X } from "@phosphor-icons/react/dist/ssr";

const items = [
  { label: "About", href: "/about" },
  { label: "Events", href: "/events" },
  { label: "Programs", href: "/programs" },
  { label: "Support", href: "/support" },
  { label: "Contact", href: "/contact" }
];

export function OrgNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="MYO home">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-forest text-paper">
            <span className="font-display text-base">M</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-medium tracking-tight">Muslim Youth of Ottawa</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink-soft">est. 1980s · volunteer-run</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active ? "bg-ink/8 text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/camp"
            className="ml-3 inline-flex items-center gap-2 rounded-full bg-ember px-4 py-1.5 text-sm font-medium text-paper transition hover:translate-y-[-1px]"
          >
            <Flame size={14} weight="fill" />
            The Camp
          </Link>
        </nav>

        <button
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-line bg-paper md:hidden">
          <nav className="mx-auto flex max-w-[1320px] flex-col px-6 py-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm text-ink-soft hover:bg-ink/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/camp"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-ember px-4 py-2.5 text-sm font-medium text-paper"
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
