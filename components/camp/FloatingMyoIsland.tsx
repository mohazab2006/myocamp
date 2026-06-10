"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

type FloatingMyoIslandProps = {
  className?: string;
  size?: "default" | "hero";
  rotate?: number;
};

export function FloatingMyoIsland({
  className = "",
  size = "default",
  rotate = -6
}: FloatingMyoIslandProps) {
  const root = useRef<HTMLDivElement>(null);
  const sizeClass =
    size === "hero"
      ? "h-[min(230px,26vh)] md:h-[min(250px,28vh)] lg:h-[min(270px,30vh)]"
      : "h-[min(180px,20vh)] w-auto";

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(el, { opacity: 0, scale: 0.55, y: 28, rotation: rotate - 8 });

        const tl = gsap.timeline({ delay: 1.15 });
        tl.to(el, {
          opacity: 1,
          scale: 1,
          y: 0,
          rotation: rotate,
          duration: 1.05,
          ease: "back.out(1.5)"
        });
        tl.to(
          el,
          {
            y: -12,
            x: 5,
            duration: 5,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
          },
          "+=0.15"
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(el, { opacity: 1, scale: 1, x: 0, y: 0, rotation: rotate });
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [rotate] }
  );

  return (
    <div
      ref={root}
      aria-hidden
      className={`camp-hero-island pointer-events-none absolute select-none ${className}`}
      style={{
        rotate: `${rotate}deg`,
        transformOrigin: "bottom left",
        opacity: 0
      }}
    >
      <img
        src="/Pictures/myo.jpeg"
        alt=""
        width={520}
        height={520}
        className={`block max-w-none drop-shadow-[0_16px_32px_rgba(45,35,25,0.22)] ${sizeClass}`}
        loading="eager"
        decoding="async"
      />
      <div
        className="absolute -bottom-1 left-[10%] h-2 w-[72%] rounded-full bg-camp-bark/20 blur-md"
        aria-hidden
      />
    </div>
  );
}
