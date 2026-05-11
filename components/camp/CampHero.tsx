"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import {
  CompassIcon,
  FlameIcon,
  KnotIcon,
  BowIcon,
  LeafIcon,
  CanoeIcon,
  TentIcon,
  MoonIcon,
  ArrowIcon,
  PaddleIcon,
  MountainIcon,
  FishIcon,
  AcornIcon,
  StarIcon,
  LanternIcon,
  SparkIcon,
  WaveIcon
} from "./Illustrations";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CampHeroProps = {
  mainRange: string;
  litRange?: string;
};

export function CampHero({ mainRange, litRange }: CampHeroProps) {
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

      <LeafIcon
        size={42}
        className="camp-hero-decoration absolute left-[8%] top-[8%] hidden text-camp-moss/80 sm:block"
        style={{ rotate: "-22deg" }}
      />
      <CompassIcon
        size={56}
        className="camp-hero-decoration absolute bottom-[14%] left-[10%] hidden text-camp-moss/85 sm:block"
        style={{ rotate: "-6deg" }}
      />
      <MoonIcon
        size={36}
        className="camp-hero-decoration absolute right-[12%] top-[6%] hidden text-camp-bark/70 sm:block"
        style={{ rotate: "18deg" }}
      />
      <StarIcon
        size={20}
        className="camp-hero-decoration absolute left-[22%] top-[3%] hidden text-camp-amber md:block"
      />
      <StarIcon
        size={14}
        className="camp-hero-decoration absolute right-[32%] top-[7%] hidden text-camp-amber/80 md:block"
        style={{ rotate: "12deg" }}
      />
      <SparkIcon
        size={18}
        className="camp-hero-decoration absolute right-[6%] bottom-[6%] hidden text-camp-flame/80 md:block"
      />

      <div className="relative mx-auto max-w-[1440px] px-6 pb-24 pt-4 md:px-10 md:pb-36 md:pt-6">
        <div className="flex items-center justify-between text-camp-bark">
          <div className="font-script text-2xl md:text-3xl">est. Camp Smitty &middot; Eganville</div>
          <div className="font-script text-xl md:text-2xl">two focused sessions · July &amp; August</div>
        </div>

        <div className="relative mt-2 flex flex-nowrap items-end justify-center gap-x-3 whitespace-nowrap leading-[0.85] md:mt-3 md:gap-x-6">
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
          <MountainIcon
            size={58}
            className="camp-hero-decoration absolute left-[18%] top-[-30px] hidden text-camp-moss md:block"
            style={{ rotate: "-4deg" }}
          />
          <LanternIcon
            size={52}
            className="camp-hero-decoration absolute right-[18%] top-[-20px] hidden text-camp-flame/80 md:block"
            style={{ rotate: "-6deg" }}
          />
          <AcornIcon
            size={36}
            className="camp-hero-decoration absolute right-[28%] top-[-36px] hidden text-camp-bark/80 lg:block"
            style={{ rotate: "10deg" }}
          />
          <LeafIcon
            size={40}
            className="camp-hero-decoration absolute left-[28%] top-[-26px] hidden text-camp-moss lg:block"
            style={{ rotate: "24deg" }}
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
          <KnotIcon
            size={38}
            className="camp-hero-decoration absolute top-[10%] left-[1%] hidden text-camp-bark/75 lg:block"
            style={{ rotate: "-18deg" }}
          />
          <ArrowIcon
            size={72}
            className="camp-hero-decoration absolute bottom-[8%] right-[8%] hidden text-camp-bark/80 md:block"
            style={{ rotate: "-14deg" }}
          />
          <ArrowIcon
            size={48}
            className="camp-hero-decoration absolute top-[35%] left-[4%] hidden text-camp-flame/70 lg:block"
            style={{ rotate: "26deg" }}
          />
          <PaddleIcon
            size={62}
            className="camp-hero-decoration absolute bottom-[2%] left-[6%] hidden text-camp-moss/85 md:block"
            style={{ rotate: "32deg" }}
          />
          <PaddleIcon
            size={48}
            className="camp-hero-decoration absolute top-[40%] right-[3%] hidden text-camp-bark/70 lg:block"
            style={{ rotate: "-28deg" }}
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
          four days of cabins, canoes &amp; campfires
        </p>

        <div className="camp-hero-meta mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Main camp", mainRange],
            ...(litRange ? [["LIT session", litRange] as const] : []),
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
