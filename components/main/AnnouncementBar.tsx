"use client";

import Link from "next/link";
import { ArrowRight, Megaphone } from "@phosphor-icons/react/ssr";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

type AnnouncementBarProps = {
  label?: string;
  message: string;
  highlight?: string;
  href: string;
  ctaText: string;
};

export function AnnouncementBar({
  label = "Big News",
  message,
  highlight,
  href,
  ctaText
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
      className="relative overflow-hidden border-b border-line bg-paper-deep/60"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, oklch(74% 0.092 78 / 0.10) 0 14px, transparent 14px 28px)"
        }}
      />
      <div className="relative mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-3 px-4 py-3 text-sm md:gap-5 md:px-8 md:py-3.5">
        <span className="announcement-badge inline-flex items-center gap-1.5 rounded-full bg-ember px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-paper shadow-[0_1px_0_oklch(22%_0.018_132/0.6)] md:text-xs">
          <Megaphone
            size={12}
            weight="fill"
            className="announcement-icon"
          />
          {label}
        </span>

        <span className="text-center text-ink md:text-base">
          {message}
          {highlight ? (
            <strong className="ml-1 font-semibold text-pine">{highlight}</strong>
          ) : null}
        </span>

        {href.startsWith("http") ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-pine transition hover:text-forest"
          >
            {ctaText}
            <ArrowRight
              size={14}
              weight="bold"
              className="transition group-hover:translate-x-0.5"
            />
          </a>
        ) : (
          <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-pine transition hover:text-forest"
          >
            {ctaText}
            <ArrowRight
              size={14}
              weight="bold"
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
        )}
      </div>
    </div>
  );
}
