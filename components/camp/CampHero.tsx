"use client";

import Link from "next/link";
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
import { CampHeroVideo } from "./CampHeroVideo";
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
        gsap.from(".camp-hero-video", {
          opacity: 0,
          duration: 0.9,
          delay: 0.85,
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
      className="topo-bg paper-grain relative overflow-x-clip bg-camp-paper"
    >
      <div className="absolute inset-0 bg-linear-to-b from-camp-sky/40 via-transparent to-camp-paper" />

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

      <div className="camp-hero-content relative z-10 mx-auto max-w-[1440px] px-4 pb-20 pt-3 sm:px-6 sm:pb-24 sm:pt-4 md:px-10 md:pb-36 md:pt-6">
        <div className="flex flex-col items-center gap-1 text-center text-camp-bark sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:text-left">
          <div className="font-script text-base leading-snug sm:text-xl md:text-2xl lg:text-3xl">
            est. Camp Smitty &middot; Eganville
          </div>
          <div className="font-script text-sm leading-snug text-camp-bark/85 sm:text-lg md:text-xl lg:text-2xl">
            two focused sessions &middot; July &amp; August
          </div>
        </div>

        <div className="relative mt-3 flex flex-col items-center gap-y-1 leading-[0.85] sm:mt-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-center sm:gap-x-3 md:gap-x-6">
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
            <div key={gi} className="flex items-end justify-center">
              {group.letters.map((l, i) => (
                <span
                  key={`${gi}-${i}`}
                  className="camp-hero-letter font-camp inline-block text-camp-bark"
                  style={{
                    fontSize: "clamp(44px, 11.5vw, 176px)",
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

        <p className="camp-hero-script font-script mx-auto mt-3 max-w-xl text-balance px-1 text-center text-[1.65rem] leading-snug text-camp-flame sm:mt-2 sm:max-w-3xl sm:text-3xl md:text-5xl">
          cabins, canoes &amp; campfires
        </p>

        <CampHeroVideo />

        <div className="camp-hero-meta mx-auto mt-8 grid w-full max-w-4xl grid-cols-1 gap-8 text-center sm:mt-10 lg:mt-12 lg:max-w-5xl lg:grid-cols-3 lg:gap-10">
          {[
            ...(litRange ? [{ label: "LIT session", value: litRange }] : []),
            { label: "Youth camp", value: mainRange, detail: "Ages 9–16" },
            { label: "Where", value: "Camp Smitty, Eganville" }
          ].map((item) => (
            <div key={item.label} className="border-t-2 border-dashed border-camp-bark/50 px-2 pt-4 md:pt-5">
              <div className="font-camp text-[1.65rem] leading-tight tracking-tight text-camp-bark sm:text-3xl md:text-4xl lg:text-[2.75rem]">
                {item.label}
              </div>
              <div className="font-camp mt-2 text-lg text-camp-bark/90 sm:mt-3 sm:text-xl md:mt-4 md:text-2xl">
                {item.value}
              </div>
              {"detail" in item && item.detail ? (
                <div className="font-camp mt-1.5 text-base text-camp-bark/85 sm:mt-2 sm:text-lg md:text-xl">
                  {item.detail}
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="camp-hero-meta mt-8 flex flex-col items-stretch justify-center gap-3 px-2 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:px-0 lg:mt-12">
          <Link
            href="/camp/register"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-camp-ink bg-camp-flame px-6 py-3 text-sm font-medium text-camp-paper transition hover:-translate-y-px hover:-rotate-1"
          >
            Open registration
          </Link>
          <Link
            href="/camp/story"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-camp-ink/80 bg-camp-paper px-6 py-3 text-sm font-medium text-camp-ink transition hover:rotate-1"
          >
            What is this place?
          </Link>
        </div>
      </div>
    </section>
  );
}
