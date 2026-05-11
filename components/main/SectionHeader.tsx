"use client";

import { useEffect, useRef, type ReactNode } from "react";

type SectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Visual scale: "lg" for major dividers, "md" (default) for in-page, "sm" for tight headers */
  size?: "sm" | "md" | "lg";
  /** Show animated scribble underline beneath the headline. Defaults to true. */
  scribble?: boolean;
  /** Stroke color for the scribble. Uses ember by default. */
  scribbleColor?: "ember" | "pine" | "brass";
  className?: string;
  tone?: "dark" | "light";
};

const scribbleStrokes: Record<NonNullable<SectionHeaderProps["scribbleColor"]>, string> = {
  ember: "oklch(58% 0.16 42)",
  pine: "oklch(38% 0.07 150)",
  brass: "oklch(66% 0.092 78)"
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const SCRIBBLE_LENGTH = 600;

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  size = "md",
  scribble = true,
  scribbleColor = "ember",
  className,
  tone = "dark"
}: SectionHeaderProps) {
  const root = useRef<HTMLDivElement>(null);

  const titleSize =
    size === "lg"
      ? "text-5xl md:text-7xl"
      : size === "sm"
      ? "text-3xl md:text-4xl"
      : "text-4xl md:text-6xl";

  const descSize =
    size === "lg" ? "text-lg md:text-xl" : "text-base md:text-lg";

  const maxW = size === "lg" ? "max-w-4xl" : "max-w-3xl";
  const descMaxW = size === "lg" ? "max-w-2xl" : "max-w-xl";

  const subdued = tone === "light" ? "text-paper/65" : "text-ink-soft";
  const eyebrowTone = tone === "light" ? "text-paper/80" : "text-brass";

  const scribbleWidthClass = size === "lg" ? "w-[44%]" : "w-[36%]";
  const scribbleStroke = scribbleStrokes[scribbleColor];

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const eyebrowEl = el.querySelector<HTMLElement>(".sh-eyebrow");
    const titleEl = el.querySelector<HTMLElement>(".sh-title");
    const scribblePath = el.querySelector<SVGPathElement>(".sh-scribble path");
    const descEl = el.querySelector<HTMLElement>(".sh-description");
    const actionEl = el.querySelector<HTMLElement>(".sh-action");

    const steps: Array<{ node: HTMLElement | SVGPathElement; delay: number }> = [];
    if (eyebrowEl) steps.push({ node: eyebrowEl, delay: 0 });
    if (titleEl) steps.push({ node: titleEl, delay: 50 });
    if (descEl) steps.push({ node: descEl, delay: 250 });
    if (actionEl) steps.push({ node: actionEl, delay: 350 });

    if (reduce || typeof IntersectionObserver === "undefined") {
      // Skip animation entirely.
      if (scribblePath) {
        scribblePath.style.strokeDashoffset = "0";
      }
      return;
    }

    // Set initial hidden states.
    for (const { node } of steps) {
      const target = node as HTMLElement;
      target.style.opacity = "0";
      target.style.transform = "translateY(18px)";
      target.style.willChange = "opacity, transform";
    }
    if (scribblePath) {
      scribblePath.style.strokeDashoffset = `${SCRIBBLE_LENGTH}`;
    }

    const reveal = () => {
      for (const { node, delay } of steps) {
        const target = node as HTMLElement;
        window.setTimeout(() => {
          target.style.transition = `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`;
          target.style.opacity = "1";
          target.style.transform = "translateY(0)";
        }, delay);
      }
      if (scribblePath) {
        window.setTimeout(() => {
          scribblePath.style.transition = `stroke-dashoffset 1.3s ${EASE}`;
          scribblePath.style.strokeDashoffset = "0";
        }, 200);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          observer.disconnect();
          window.clearTimeout(failsafe);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.01 }
    );

    observer.observe(el);

    const failsafe = window.setTimeout(reveal, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [eyebrow, description, action, scribble]);

  return (
    <div ref={root} className={`mx-auto ${maxW} text-center ${className ?? ""}`}>
      {eyebrow ? (
        <div className={`sh-eyebrow eyebrow ${eyebrowTone}`}>{eyebrow}</div>
      ) : null}

      <div className="relative inline-block w-full">
        <h2
          className={`sh-title headline-display ${eyebrow ? "mt-4" : ""} ${titleSize} leading-[1.04]`}
        >
          {title}
        </h2>

        {scribble ? (
          <svg
            aria-hidden
            viewBox="0 0 400 24"
            preserveAspectRatio="none"
            className={`sh-scribble pointer-events-none absolute left-1/2 -translate-x-1/2 ${
              size === "lg" ? "-bottom-3 h-4" : "-bottom-2 h-3"
            } ${scribbleWidthClass}`}
          >
            <path
              d="M6 14 Q 70 4 140 12 T 280 10 T 394 8"
              fill="none"
              stroke={scribbleStroke}
              strokeWidth={size === "lg" ? "4" : "3"}
              strokeLinecap="round"
              strokeDasharray={SCRIBBLE_LENGTH}
              strokeDashoffset="0"
            />
          </svg>
        ) : null}
      </div>

      {description ? (
        <p
          className={`sh-description mx-auto mt-7 ${descMaxW} ${descSize} leading-relaxed ${subdued}`}
        >
          {description}
        </p>
      ) : null}
      {action ? (
        <div className="sh-action mt-7 flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      ) : null}
    </div>
  );
}
