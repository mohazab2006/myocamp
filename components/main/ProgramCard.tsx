import Link from "next/link";
import type { OrgProgram } from "@/lib/types";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";

export function ProgramCard({ program }: { program: OrgProgram }) {
  return (
    <Link
      href={`/programs/${program.slug}`}
      className="group grid grid-cols-12 gap-4 border-t border-line py-8 transition"
    >
      <div className="col-span-12 md:col-span-3">
        <div className="text-xs uppercase tracking-[0.16em] text-brass">{program.cadence}</div>
        <div className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-soft">
          {program.audience.join(" · ")}
        </div>
      </div>
      <div className="col-span-12 md:col-span-6">
        <h3 className="font-display text-3xl leading-tight tracking-tight">{program.title}</h3>
        <p className="mt-2 max-w-[52ch] text-ink-soft">{program.blurb}</p>
      </div>
      <div className="col-span-12 flex items-end justify-between md:col-span-3 md:justify-end">
        <span
          className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.16em] ${
            program.active ? "bg-pine/10 text-pine" : "bg-ink/8 text-ink-soft"
          }`}
        >
          {program.active ? "Currently running" : "Past program"}
        </span>
        <ArrowUpRight
          size={20}
          className="ml-3 hidden text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-ink md:inline"
        />
      </div>
    </Link>
  );
}
