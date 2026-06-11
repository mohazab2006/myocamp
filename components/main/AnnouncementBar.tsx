"use client";

import Link from "next/link";
import { ArrowRight, Megaphone } from "@phosphor-icons/react/ssr";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import type { HomeBigNewsLink } from "@/lib/content/home-camp";

type AnnouncementBarProps = {
  label?: string;
  message: string;
  highlight?: string;
  links: HomeBigNewsLink[];
};

export function AnnouncementBar({
  label = "Big News",
  message,
  highlight,
  links
}: AnnouncementBarProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(".announcement-badge", {
          scale: 1.06,
          duration: 1.6,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
        gsap.to(".announcement-icon", {
          rotation: -8,
          duration: 0.7,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          transformOrigin: "50% 60%"
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="relative overflow-hidden border-b border-line bg-paper-deep/70"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, oklch(74% 0.092 78 / 0.12) 0 14px, transparent 14px 28px)"
        }}
      />
      <div className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-3 px-4 py-4 text-center sm:px-6 md:flex-row md:flex-wrap md:justify-center md:gap-4 md:px-10 md:py-5">
        <span className="announcement-badge inline-flex items-center gap-2 rounded-full bg-ember px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper shadow-[0_1px_0_oklch(22%_0.018_132/0.6)] md:text-xs">
          <Megaphone size={14} weight="fill" className="announcement-icon" />
          {label}
        </span>

        <p className="max-w-3xl text-base font-medium leading-snug text-ink md:text-lg">
          {message}
          {highlight ? (
            <strong className="ml-1.5 font-semibold text-pine">{highlight}</strong>
          ) : null}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
          {links.map((link) => (
            <AnnouncementLink key={`${link.href}-${link.label}`} link={link} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnnouncementLink({ link }: { link: HomeBigNewsLink }) {
  const className = link.primary
    ? "group inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-medium text-paper transition hover:bg-pine"
    : "group inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-paper px-4 py-2 text-sm font-medium text-ink transition hover:border-pine hover:text-pine";

  const content = (
    <>
      {link.label}
      <ArrowRight
        size={14}
        weight="bold"
        className="transition group-hover:translate-x-0.5"
      />
    </>
  );

  if (link.href.startsWith("http")) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {content}
    </Link>
  );
}
