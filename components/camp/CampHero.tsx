"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { CompassIcon, FlameIcon, KnotIcon, BowIcon } from "./Illustrations";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function CampHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".camp-hero-letter", {
          y: 60,
          opacity: 0,
          rotation: -6,
          duration: 0.9,
          stagger: 0.06,
          ease: "back.out(1.4)"
        });
        gsap.from(".camp-hero-script", {
          opacity: 0,
          y: 20,
          duration: 1.2,
          delay: 0.6,
          ease: "expo.out"
        });
        gsap.from(".camp-hero-decoration", {
          opacity: 0,
          scale: 0.6,
          rotation: -20,
          duration: 0.9,
          stagger: 0.1,
          delay: 0.8,
          ease: "back.out(1.6)"
        });
        gsap.from(".camp-hero-meta", {
          opacity: 0,
          y: 16,
          duration: 0.8,
          delay: 1.0,
          ease: "expo.out"
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const groups: { letters: string[]; flameLetters: string[] }[] = [
    { letters: ["M", "Y", "O"], flameLetters: [] },
    { letters: ["C", "A", "M", "P"], flameLetters: ["C", "P"] }
  ];

  return (
    <section
      ref={root}
      className="topo-bg paper-grain relative overflow-hidden bg-camp-paper"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-camp-sky/40 via-transparent to-camp-paper" />

      <div className="relative mx-auto max-w-[1440px] px-6 pb-24 pt-16 md:px-10 md:pb-36 md:pt-24">
        <div className="flex items-center justify-between text-camp-bark">
          <div className="font-script text-2xl md:text-3xl">est. Camp Smitty &middot; Eganville</div>
          <div className="font-script text-xl md:text-2xl">a week every August</div>
        </div>

        <div className="relative mt-12 flex flex-nowrap items-end justify-center gap-x-3 whitespace-nowrap leading-[0.85] md:gap-x-6">
          <FlameIcon
            size={64}
            className="camp-hero-decoration absolute left-[6%] top-[-12px] hidden text-camp-flame md:block"
            style={{ rotate: "-12deg" }}
          />
          <CompassIcon
            size={72}
            className="camp-hero-decoration absolute right-[6%] top-[-24px] hidden text-camp-bark md:block"
            style={{ rotate: "16deg" }}
          />
          <KnotIcon
            size={56}
            className="camp-hero-decoration absolute bottom-[20%] left-[-2%] hidden text-camp-moss lg:block"
            style={{ rotate: "8deg" }}
          />
          <BowIcon
            size={64}
            className="camp-hero-decoration absolute bottom-[24%] right-[-1%] hidden text-camp-amber lg:block"
            style={{ rotate: "-22deg" }}
          />

          {groups.map((group, gi) => (
            <div key={gi} className="flex flex-nowrap items-end">
              {group.letters.map((l, i) => (
                <span
                  key={`${gi}-${i}`}
                  className="camp-hero-letter font-camp inline-block text-camp-bark"
                  style={{
                    fontSize: "clamp(54px, 12.5vw, 176px)",
                    color: group.flameLetters.includes(l)
                      ? "var(--color-camp-flame)"
                      : undefined
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          ))}
        </div>

        <p className="camp-hero-script font-script mx-auto mt-2 max-w-3xl text-center text-3xl leading-tight text-camp-flame md:text-5xl">
          a week of cabins, canoes &amp; campfires
        </p>

        <div className="camp-hero-meta mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 text-center sm:grid-cols-3">
          {[
            ["When", "Aug 16 – 22, 2026"],
            ["Where", "Camp Smitty, Eganville"],
            ["Who", "Ages 9 – 19 · Boys & Girls"]
          ].map(([k, v]) => (
            <div key={k} className="border-t-2 border-dashed border-camp-bark/40 pt-3">
              <div className="text-xs uppercase tracking-[0.18em] text-camp-bark/65">{k}</div>
              <div className="font-camp mt-1 text-2xl text-camp-bark">{v}</div>
            </div>
          ))}
        </div>

        <div className="camp-hero-meta mt-12 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/camp/register"
            className="inline-flex items-center gap-2 rounded-full border-2 border-camp-ink bg-camp-flame px-6 py-3 text-sm font-medium text-camp-paper transition hover:translate-y-[-1px] hover:rotate-[-1deg]"
          >
            <FlameIcon size={16} />
            Open registration
          </a>
          <a
            href="/camp/story"
            className="inline-flex items-center gap-2 rounded-full border-2 border-camp-ink/80 bg-camp-paper px-6 py-3 text-sm font-medium text-camp-ink transition hover:rotate-[1deg]"
          >
            What is this place?
          </a>
        </div>
      </div>
    </section>
  );
}
