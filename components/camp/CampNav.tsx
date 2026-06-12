"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, List, X } from "@phosphor-icons/react/ssr";
import { FlameIcon, KnotIcon, PaintedDivider } from "./Illustrations";

const navItems = [
  { label: "Story", href: "/camp/story" },
  { label: "Location", href: "/camp/location" },
  { label: "Rules", href: "/camp/rules" },
  { label: "Support", href: "/camp/support" }
];

const registerHref = "/camp/register";

function isActive(pathname: string, href: string) {
  if (href === "/camp") return pathname === "/camp";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CampNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const onCampHome = pathname === "/camp";

  return (
    <header className="paper-grain topo-bg sticky top-0 z-40 overflow-hidden border-b-2 border-camp-bark/20 bg-camp-paper/90 shadow-[0_10px_30px_oklch(38%_0.08_50_/_0.08)] backdrop-blur supports-[backdrop-filter]:bg-camp-paper/78">
      <div className="relative">
        <KnotIcon
          size={52}
          aria-hidden
          className="pointer-events-none absolute -left-8 top-1 hidden text-camp-flame/25 md:block"
        />
        <KnotIcon
          size={44}
          aria-hidden
          className="pointer-events-none absolute -right-6 top-1 hidden scale-x-[-1] text-camp-amber/35 md:block"
        />
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-6 pb-2.5 pt-3 md:px-10 md:pb-3 md:pt-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 justify-self-start rounded-full border border-camp-bark/15 bg-camp-paper/70 px-3 py-1.5 text-sm text-camp-bark transition hover:-translate-y-px hover:border-camp-flame/35 hover:bg-camp-paper-soft hover:text-camp-flame active:translate-y-0"
          >
            <ArrowLeft
              size={16}
              weight="bold"
              className="transition group-hover:-translate-x-0.5"
            />
            <span className="hidden sm:inline">Back to MYO</span>
            <span className="sm:hidden">Back</span>
          </Link>

          <Link
            href="/camp"
            className="group justify-self-center text-center transition hover:-translate-y-px active:translate-y-0"
          >
            <span className="inline-flex items-center gap-2">
              <FlameIcon
                size={22}
                className="text-camp-flame transition group-hover:rotate-[-8deg] group-hover:scale-110"
              />
              <span
                className={`font-camp text-2xl leading-none tracking-tight transition md:text-3xl ${
                  onCampHome ? "text-camp-flame" : "text-camp-bark group-hover:text-camp-flame"
                }`}
              >
                MYO Camp
              </span>
            </span>
            <span className="font-script mt-0 block text-base leading-none text-camp-amber transition group-hover:text-camp-flame md:text-lg">
              summer on the lake
            </span>
          </Link>

          <div className="flex items-center justify-self-end gap-1.5">
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition hover:-translate-y-px hover:rotate-[-1deg] active:translate-y-0 ${
                      active
                        ? "border border-camp-bark/20 bg-camp-bark text-camp-paper shadow-[0_2px_0_oklch(20%_0.04_60)]"
                        : "text-camp-bark/80 hover:bg-camp-paper-soft hover:text-camp-flame"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={registerHref}
                className={`ml-1 inline-flex items-center gap-2 rounded-full border-2 border-camp-ink px-4 py-2 text-sm font-medium transition hover:-translate-y-px hover:rotate-[-1deg] active:translate-y-0 ${
                  isActive(pathname, registerHref)
                    ? "bg-camp-amber text-camp-ink shadow-[0_3px_0_oklch(20%_0.04_60)]"
                    : "bg-camp-flame text-camp-paper shadow-[0_3px_0_oklch(20%_0.04_60)] hover:bg-camp-amber hover:text-camp-ink"
                }`}
              >
                Register
              </Link>
            </nav>

            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-camp-bark/15 text-camp-bark transition hover:-translate-y-px hover:border-camp-flame/35 hover:bg-camp-paper-soft hover:text-camp-flame active:translate-y-0 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t-2 border-camp-bark/15 bg-camp-paper/95 lg:hidden">
            <nav className="mx-auto flex max-w-[1440px] flex-col gap-1 px-6 py-4">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-3 py-3 text-base font-medium transition ${
                      active
                        ? "border border-camp-bark/20 bg-camp-bark text-camp-paper"
                        : "text-camp-bark hover:bg-camp-paper-soft hover:text-camp-flame"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={registerHref}
                className={`mt-2 inline-flex items-center justify-center gap-2 rounded-full border-2 border-camp-ink px-4 py-3 text-sm font-medium transition ${
                  isActive(pathname, registerHref)
                    ? "bg-camp-amber text-camp-ink"
                    : "bg-camp-flame text-camp-paper"
                }`}
              >
                Register
              </Link>
            </nav>
          </div>
        )}
      </div>

      <PaintedDivider className="text-camp-flame/55" />
    </header>
  );
}
