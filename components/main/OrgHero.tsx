"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Flame } from "@phosphor-icons/react/dist/ssr";
import { RotatingPhoto, useRotator, type RotatingSlide } from "./RotatingPhoto";
import {
  CompassIcon,
  FlameIcon,
  KnotIcon,
  BowIcon,
  LeafIcon,
  SparkIcon,
  TopoDivider
} from "../camp/Illustrations";
import { Marquee } from "./Marquee";
import { siteSettings } from "@/lib/content/org";

gsap.registerPlugin(useGSAP);

const heroBackdrop = [
  "/Pictures/trails.jpg",
  "/Pictures/viewOfGCabin.jpg",
  "/Pictures/beach.jpg"
];

type HeroSlide = RotatingSlide & { caption: string };

const heroTiles: { slides: HeroSlide[]; intervalMs: number; offsetMs: number }[] = [
  {
    slides: [
      { src: "/Pictures/basketball.jpg", caption: "Court behind the cabins" },
      { src: "/Pictures/sports.jpg", caption: "Field day" }
    ],
    intervalMs: 5200,
    offsetMs: 600
  },
  {
    slides: [
      { src: "/Pictures/assembly.jpg", caption: "Friday assembly" },
      {
        src: "/Pictures/LITgroup.JPG",
        caption: "LIT cohort, late night",
        objectPosition: "25% center"
      }
    ],
    intervalMs: 5600,
    offsetMs: 1400
  },
  {
    slides: [
      { src: "/Pictures/1455452_orig.jpg", caption: "Camp-wide games day" },
      { src: "/Pictures/2869777_orig.jpg", caption: "On the field" }
    ],
    intervalMs: 5000,
    offsetMs: 2200
  },
  {
    slides: [
      { src: "/Pictures/bFirePit.jpg", caption: "Boys' fire-circle" },
      { src: "/Pictures/gFirePit.jpg", caption: "Girls' fire-circle" }
    ],
    intervalMs: 5400,
    offsetMs: 3000
  }
];

const marqueeItems = [
  "Est. 1980s",
  "Ottawa · Camp Smitty",
  "Volunteer-run",
  "Hikes · Halaqas · Camp",
  "Year-round",
  "Faith first, no apology",
  "Subsidise a kid"
];

function HeroTile({
  slides,
  intervalMs,
  offsetMs,
  lift
}: {
  slides: HeroSlide[];
  intervalMs: number;
  offsetMs: number;
  lift: string;
}) {
  const idx = useRotator(slides.length, intervalMs, offsetMs);
  const transitionMs = 1500;

  return (
    <figure className={`org-hero-tile overflow-hidden bg-paper-deep ${lift}`}>
      <div className="relative aspect-[4/5]">
        {slides.map((slide, i) => {
          const isActive = i === idx;
          return (
            <img
              key={slide.src}
              src={slide.src}
              alt={isActive ? slide.caption : ""}
              aria-hidden={!isActive}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: isActive ? 1 : 0,
                objectPosition: slide.objectPosition ?? "center",
                transition: `opacity ${transitionMs}ms ease-in-out`
              }}
            />
          );
        })}
      </div>
      <figcaption className="relative h-8 overflow-hidden">
        {slides.map((slide, i) => (
          <span
            key={slide.caption}
            aria-hidden={i !== idx}
            className="absolute inset-0 flex items-center px-3 text-[11px] uppercase tracking-[0.16em] text-ink-soft"
            style={{
              opacity: i === idx ? 1 : 0,
              transition: `opacity ${transitionMs}ms ease-in-out`
            }}
          >
            {slide.caption}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function OrgHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();

        tl.from(".org-hero-eyebrow", {
          opacity: 0,
          y: 8,
          duration: 0.7,
          ease: "expo.out"
        })
          .from(
            ".org-hero-letter",
            {
              yPercent: 110,
              opacity: 0,
              rotation: -4,
              duration: 1.1,
              stagger: 0.07,
              ease: "expo.out"
            },
            "<0.05"
          )
          .from(
            ".org-hero-sunburst",
            { opacity: 0, scale: 0.6, duration: 1.4, ease: "expo.out" },
            "<0.15"
          )
          .from(
            ".org-hero-italic",
            { opacity: 0, y: 26, duration: 1.0, ease: "expo.out" },
            "<0.4"
          )
          .from(
            ".org-hero-scribble path",
            { strokeDashoffset: 600, duration: 1.6, ease: "expo.out" },
            "<0.25"
          )
          .from(
            ".org-hero-lede",
            { opacity: 0, y: 14, duration: 0.85, ease: "expo.out" },
            "<0.35"
          )
          .from(
            ".org-hero-meta",
            {
              opacity: 0,
              y: 16,
              duration: 0.75,
              stagger: 0.08,
              ease: "expo.out"
            },
            "<0.2"
          )
          .from(
            ".org-hero-decoration",
            {
              opacity: 0,
              scale: 0.55,
              rotation: "-=24",
              duration: 1.1,
              stagger: 0.08,
              ease: "back.out(1.6)"
            },
            "<-0.4"
          )
          .from(
            ".org-hero-tile",
            {
              opacity: 0,
              y: 50,
              duration: 1,
              stagger: 0.08,
              ease: "expo.out"
            },
            "<0.05"
          );

        // Continuous floating on each illustration — unique per shape
        const floats: { sel: string; y: number; r: number; dur: number }[] = [
          { sel: ".float-compass", y: -10, r: 3, dur: 4.2 },
          { sel: ".float-flame", y: -12, r: -4, dur: 3.6 },
          { sel: ".float-leaf", y: -8, r: 5, dur: 5.1 },
          { sel: ".float-spark", y: -6, r: 10, dur: 3.0 },
          { sel: ".float-knot", y: -7, r: -3, dur: 4.6 },
          { sel: ".float-bow", y: -9, r: 4, dur: 4.9 }
        ];

        floats.forEach((f) => {
          gsap.to(f.sel, {
            y: f.y,
            rotation: `+=${f.r}`,
            duration: f.dur,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut"
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-paper">
      {/* Rotating photo wash with ken-burns drift */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]">
        <div className="org-hero-kenburns h-full w-full">
          <RotatingPhoto
            images={heroBackdrop}
            intervalMs={6000}
            transitionMs={2200}
          />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper via-paper/30 to-paper" />

      {/* Sunburst radial glow behind wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2"
      >
        <div
          className="org-hero-sunburst h-[760px] w-[760px] rounded-full md:h-[1100px] md:w-[1100px]"
          style={{
            background:
              "radial-gradient(circle, oklch(74% 0.14 78 / 0.32) 0%, oklch(66% 0.10 78 / 0.14) 30%, oklch(58% 0.16 42 / 0.06) 55%, transparent 72%)"
          }}
        />
      </div>

      {/* Corner illustrations — paper-feel ornaments */}
      <CompassIcon
        size={88}
        aria-hidden
        className="org-hero-decoration float-compass pointer-events-none absolute left-[3%] top-[18%] hidden text-pine/40 md:block lg:left-[5%]"
        style={{ rotate: "-10deg" }}
      />
      <FlameIcon
        size={76}
        aria-hidden
        className="org-hero-decoration float-flame pointer-events-none absolute right-[4%] top-[14%] hidden text-ember/65 md:block lg:right-[6%]"
        style={{ rotate: "12deg" }}
      />
      <LeafIcon
        size={56}
        aria-hidden
        className="org-hero-decoration float-leaf pointer-events-none absolute left-[8%] top-[6%] hidden text-moss/60 lg:block"
        style={{ rotate: "-26deg" }}
      />
      <SparkIcon
        size={48}
        aria-hidden
        className="org-hero-decoration float-spark pointer-events-none absolute right-[10%] top-[8%] hidden text-brass/80 lg:block"
        style={{ rotate: "8deg" }}
      />
      <KnotIcon
        size={70}
        aria-hidden
        className="org-hero-decoration float-knot pointer-events-none absolute bottom-[36%] left-[2%] hidden text-brass/50 md:block lg:bottom-[38%]"
        style={{ rotate: "8deg" }}
      />
      <BowIcon
        size={74}
        aria-hidden
        className="org-hero-decoration float-bow pointer-events-none absolute bottom-[34%] right-[3%] hidden text-pine/50 md:block lg:bottom-[36%] lg:right-[5%]"
        style={{ rotate: "-22deg" }}
      />

      <div className="relative mx-auto max-w-[1320px] px-6 pb-12 pt-14 md:px-10 md:pb-16 md:pt-20">
        {/* Top eyebrow */}
        <div className="org-hero-eyebrow flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.22em] text-ink-soft md:gap-4 md:text-xs">
          <span aria-hidden className="inline-block h-px w-8 bg-line md:w-12" />
          Muslim Youth of Ottawa &middot; Ottawa, ON
          <span aria-hidden className="inline-block h-px w-8 bg-line md:w-12" />
        </div>

        {/* Wordmark */}
        <h1 className="sr-only">Muslim Youth of Ottawa</h1>
        <div className="relative mt-8 flex flex-nowrap items-baseline justify-center gap-x-1 overflow-hidden whitespace-nowrap leading-[0.82] pb-3 md:mt-10">
          {[
            { l: "M", accent: false },
            { l: "Y", accent: false },
            { l: "O", accent: true }
          ].map((letter, i) => (
            <span
              key={i}
              className={`org-hero-letter font-display inline-block ${
                letter.accent ? "text-ember" : "text-ink"
              }`}
              style={{
                fontSize: "clamp(140px, 26vw, 320px)",
                fontWeight: 400,
                letterSpacing: "-0.045em",
                textShadow: letter.accent
                  ? "0 6px 0 oklch(22% 0.018 132 / 0.07)"
                  : "0 4px 0 oklch(22% 0.018 132 / 0.05)"
              }}
              aria-hidden
            >
              {letter.l}
            </span>
          ))}
        </div>

        {/* Script subtitle + scribble underline */}
        <div className="relative mx-auto -mt-2 w-fit md:-mt-3">
          <p className="org-hero-italic font-script text-center text-3xl leading-tight text-pine md:text-5xl lg:text-6xl">
            Muslim Youth of Ottawa
          </p>
          <svg
            aria-hidden
            viewBox="0 0 400 24"
            preserveAspectRatio="none"
            className="org-hero-scribble pointer-events-none absolute -bottom-2 left-1/2 h-3 w-[80%] -translate-x-1/2 md:-bottom-3 md:h-4"
          >
            <path
              d="M6 14 Q 70 4 140 12 T 280 10 T 394 8"
              fill="none"
              stroke="oklch(58% 0.16 42)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="600"
              strokeDashoffset="0"
            />
          </svg>
        </div>

        {/* Lead line */}
        <p className="org-hero-lede mx-auto mt-9 max-w-2xl text-center text-base leading-relaxed text-ink-soft md:mt-11 md:text-xl">
          Volunteer-led since the 1980s &mdash; programs, events,{" "}
          <span className="text-ink">
            and a four-day summer camp at{" "}
            <span className="font-script italic text-pine">Camp Smitty</span>.
          </span>
        </p>

        {/* Primary CTAs */}
        <div className="org-hero-meta mt-9 flex flex-wrap items-center justify-center gap-3 md:mt-10">
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-medium text-paper shadow-[0_1px_0_oklch(22%_0.018_132)] transition hover:bg-pine active:translate-y-[1px]"
          >
            What&apos;s coming up
            <ArrowRight
              size={14}
              weight="bold"
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="/camp"
            className="group inline-flex items-center gap-2 rounded-full border border-ink/25 bg-paper px-6 py-3 text-sm font-medium text-ink transition hover:border-ink hover:bg-paper-deep active:translate-y-[1px]"
          >
            <Flame
              size={14}
              weight="fill"
              className="text-ember transition group-hover:scale-110"
            />
            The Summer Camp
          </Link>
        </div>

        {/* Tertiary action */}
        <div className="org-hero-meta mt-5 text-center text-sm text-ink-soft">
          <Link
            href="/support"
            className="underline decoration-line decoration-1 underline-offset-[6px] transition hover:text-ink hover:decoration-ink"
          >
            Interested in volunteering or donating?
          </Link>
          <span className="mx-2 text-ink-soft/60">·</span>
          <a
            href={siteSettings.newsletterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-line decoration-1 underline-offset-[6px] transition hover:text-ink hover:decoration-ink"
          >
            Join the Adventure List
          </a>
        </div>

        {/* Marquee ribbon */}
        <div className="org-hero-meta mt-14 md:mt-16">
          <Marquee items={marqueeItems} tone="paper" />
        </div>

        {/* Photo strip — rotating, each tile cross-fades independently */}
        <div className="mt-12 grid grid-cols-2 gap-3 md:mt-16 md:grid-cols-4 md:gap-4">
          {heroTiles.map((tile, i) => (
            <HeroTile
              key={i}
              slides={tile.slides}
              intervalMs={tile.intervalMs}
              offsetMs={tile.offsetMs}
              lift={i % 2 === 0 ? "md:translate-y-6" : "md:-translate-y-2"}
            />
          ))}
        </div>
      </div>

      {/* Bottom topo divider */}
      <TopoDivider className="relative text-pine/25" />
    </section>
  );
}
