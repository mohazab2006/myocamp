"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/camps", label: "Camps" },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/announcement", label: "Banner" },
  { href: "/admin/setup", label: "Setup" }
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex flex-wrap items-center gap-1.5 text-sm">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "border border-forest bg-forest px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-paper"
                : "border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-line hover:bg-paper-deep/60 hover:text-ink"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
