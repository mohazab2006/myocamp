import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowSquareOut, Lock, SignOut } from "@phosphor-icons/react/ssr";

import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminSession } from "@/lib/admin/auth";
import { logoutAction } from "./actions";

import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();
  const isSignedIn = session.status === "authorized" || session.status === "forbidden";
  const showNav = session.status === "authorized";

  return (
    <div className="min-h-dvh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-3 px-5 py-3 md:flex-row md:items-center md:justify-between md:px-8">
          <Link href="/admin" className="flex flex-col leading-tight">
            <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-ember">
              <Lock size={12} weight="duotone" /> Admin
            </span>
            <span className="font-display text-lg tracking-tight text-ink">Muslim Youth of Ottawa</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {showNav ? <AdminNav /> : null}
            <div className="ml-1 flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex h-9 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
              >
                View site
                <ArrowSquareOut size={12} weight="bold" />
              </Link>
              {isSignedIn ? (
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="inline-flex h-9 items-center gap-1.5 border border-line bg-paper px-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-soft transition hover:border-pine hover:text-ink"
                  >
                    <SignOut size={12} weight="bold" />
                    Sign out
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
