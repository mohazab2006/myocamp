"use client";

import { RotatingPhoto } from "./RotatingPhoto";
import { SectionHeader } from "./SectionHeader";
import { RevealOnScroll } from "./RevealOnScroll";
import {
  SparkIcon,
  LeafIcon,
  CompassIcon,
  CanoeIcon
} from "../camp/Illustrations";

const galleryTiles: { images: string[]; intervalMs: number; offsetMs: number; lift: string }[] = [
  {
    images: [
      "/Pictures/camp1.jpg",
      "/Pictures/camp3.jpg",
      "/Pictures/camp5.jpg",
      "/Pictures/gamesRoom.jpg"
    ],
    intervalMs: 4200,
    offsetMs: 0,
    lift: "md:translate-y-6"
  },
  {
    images: [
      "/Pictures/camp2.jpg",
      "/Pictures/boatHouse.jpg",
      "/Pictures/insideGirlsCabin.jpg",
      "/Pictures/library.jpg"
    ],
    intervalMs: 4800,
    offsetMs: 900,
    lift: "md:-translate-y-2"
  },
  {
    images: [
      "/Pictures/camp4.jpg",
      "/Pictures/camp6.jpg",
      "/Pictures/lego.jpg",
      "/Pictures/artsAndCrafts.jpg"
    ],
    intervalMs: 4500,
    offsetMs: 1800,
    lift: "md:translate-y-10"
  },
  {
    images: [
      "/Pictures/camp7.jpg",
      "/Pictures/messHall.jpg",
      "/Pictures/recHall.jpg",
      "/Pictures/outisdeArts.jpg"
    ],
    intervalMs: 5100,
    offsetMs: 2700,
    lift: "md:-translate-y-4"
  }
];

export function RotatingGallery() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-paper-deep/40">
      {/* Floating ornaments */}
      <LeafIcon
        size={56}
        aria-hidden
        className="pointer-events-none absolute left-[3%] top-12 hidden text-moss/60 md:block"
        style={{ rotate: "-22deg" }}
      />
      <SparkIcon
        size={40}
        aria-hidden
        className="pointer-events-none absolute right-[5%] top-16 hidden text-brass/80 md:block"
        style={{ rotate: "12deg" }}
      />
      <CompassIcon
        size={64}
        aria-hidden
        className="pointer-events-none absolute right-[3%] bottom-[16%] hidden text-pine/35 lg:block"
        style={{ rotate: "10deg" }}
      />
      <CanoeIcon
        size={72}
        aria-hidden
        className="pointer-events-none absolute bottom-[14%] left-[4%] hidden text-pine/35 lg:block"
        style={{ rotate: "-8deg" }}
      />

      <div className="relative mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-28">
        <SectionHeader
          eyebrow="In motion"
          title="Every week, a memory."
          description="A rotating glimpse at decades of MYO — trails, halaqas, courts, fire-circles, friends."
          scribbleColor="brass"
        />

        <RevealOnScroll
          className="mt-14 grid grid-cols-2 gap-3 pb-8 md:mt-16 md:grid-cols-4 md:gap-4 md:pb-12"
          y={48}
          stagger={0.1}
        >
          {galleryTiles.map((tile, i) => (
            <figure
              key={i}
              className={`group overflow-hidden bg-paper transition duration-500 hover:scale-[1.02] hover:shadow-[0_18px_40px_-20px_oklch(22%_0.018_132_/_0.45)] ${
                tile.lift
              } ${i % 2 ? "hover:-rotate-1" : "hover:rotate-1"}`}
            >
              <div className="aspect-[3/4]">
                <RotatingPhoto
                  images={tile.images}
                  intervalMs={tile.intervalMs}
                  offsetMs={tile.offsetMs}
                  transitionMs={1400}
                />
              </div>
            </figure>
          ))}
        </RevealOnScroll>

        <div className="mt-14 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.18em] leading-none text-ink-soft md:mt-20 md:text-xs">
          <span aria-hidden className="h-px w-8 shrink-0 bg-line md:w-12" />
          <span className="shrink-0">1980s &mdash; today</span>
          <span aria-hidden className="h-px w-8 shrink-0 bg-line md:w-12" />
        </div>
      </div>
    </section>
  );
}
