"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** CSS selector for items to stagger. Defaults to ":scope > *" (direct children). */
  selector?: string;
  /** Y offset (px) the items start from. Defaults to 32. */
  y?: number;
  /** Stagger between items (s). Defaults to 0.08. */
  stagger?: number;
  /** Duration of each item's entrance (s). Defaults to 0.9. */
  duration?: number;
  className?: string;
};

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export function RevealOnScroll({
  children,
  selector = ":scope > *",
  y = 32,
  stagger = 0.08,
  duration = 0.9,
  className
}: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const targets = Array.from(
      el.querySelectorAll<HTMLElement>(selector)
    );
    if (targets.length === 0) return;

    // If reduced motion or no IO support, leave everything visible.
    if (reduce || typeof IntersectionObserver === "undefined") return;

    // Apply hidden state inline.
    for (const t of targets) {
      t.style.opacity = "0";
      t.style.transform = `translateY(${y}px)`;
      t.style.willChange = "opacity, transform";
    }

    const reveal = () => {
      targets.forEach((t, i) => {
        const delay = i * stagger * 1000;
        window.setTimeout(() => {
          t.style.transition = `opacity ${duration}s ${EASE}, transform ${duration}s ${EASE}`;
          t.style.opacity = "1";
          t.style.transform = "translateY(0)";
        }, delay);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          observer.disconnect();
          window.clearTimeout(failsafe);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );

    observer.observe(el);

    // Failsafe: if for any reason the observer never fires (e.g., element
    // never scrolls into view, browser oddity), reveal after 2.5s anyway so
    // content is never permanently hidden.
    const failsafe = window.setTimeout(reveal, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(failsafe);
    };
  }, [selector, y, stagger, duration]);

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
