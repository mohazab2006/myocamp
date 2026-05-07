"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, List, X } from "@phosphor-icons/react/dist/ssr";

const items = [
  { label: "Story", href: "/camp/story" },
  { label: "Location", href: "/camp/location" },
  { label: "Register", href: "/camp/register" },
  { label: "Rules", href: "/camp/rules" },
  { label: "Support", href: "/camp/support" }
];

export function CampNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-camp-bark/20 bg-camp-paper/85 backdrop-blur supports-[backdrop-filter]:bg-camp-paper/72">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2 text-sm text-camp-bark hover:text-camp-flame">
          <ArrowLeft size={16} weight="bold" />
          <span className="hidden sm:inline">Back to MYO</span>
          <span className="sm:hidden">Back</span>
        </Link>

        <Link href="/camp" className="font-camp text-2xl tracking-tight text-camp-bark md:text-3xl">
          MYO Camp
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  active ? "bg-camp-bark text-camp-paper" : "text-camp-bark/80 hover:text-camp-flame"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="md:hidden text-camp-bark"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </div>

      {open && (
        <div className="border-t-2 border-camp-bark/15 bg-camp-paper md:hidden">
          <nav className="mx-auto flex max-w-[1440px] flex-col px-6 py-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-3 text-sm text-camp-bark hover:bg-camp-paper-soft"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
