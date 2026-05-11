import { Fragment, type ReactNode } from "react";
import { SparkIcon } from "../camp/Illustrations";

type Props = {
  items: string[];
  /** Optional separator node, defaults to a small ember spark icon. */
  separator?: ReactNode;
  /** Track CSS class for animation duration tuning. Defaults to the standard 38s. */
  speedClassName?: string;
  /** Bg style — "paper" / "deep" / "forest" */
  tone?: "paper" | "deep" | "forest";
  className?: string;
};

const toneStyles: Record<NonNullable<Props["tone"]>, string> = {
  paper: "bg-paper/60 border-y border-line text-ink",
  deep: "bg-paper-deep/70 border-y border-line text-ink",
  forest: "bg-forest text-paper border-y border-paper/15"
};

const fadeStyles: Record<NonNullable<Props["tone"]>, { left: string; right: string }> = {
  paper: {
    left: "bg-gradient-to-r from-paper to-transparent",
    right: "bg-gradient-to-l from-paper to-transparent"
  },
  deep: {
    left: "bg-gradient-to-r from-paper-deep to-transparent",
    right: "bg-gradient-to-l from-paper-deep to-transparent"
  },
  forest: {
    left: "bg-gradient-to-r from-forest to-transparent",
    right: "bg-gradient-to-l from-forest to-transparent"
  }
};

export function Marquee({
  items,
  separator,
  speedClassName = "org-hero-marquee-track",
  tone = "paper",
  className
}: Props) {
  const sep = separator ?? (
    <SparkIcon size={16} aria-hidden className="shrink-0 text-ember" />
  );
  const fades = fadeStyles[tone];

  return (
    <div
      className={`relative overflow-hidden py-3 ${toneStyles[tone]} ${className ?? ""}`}
    >
      <div className={`${speedClassName} flex items-center whitespace-nowrap`}>
        {[0, 1].map((cycle) => (
          <Fragment key={cycle}>
            {items.map((item, i) => (
              <Fragment key={`${cycle}-${i}`}>
                <span className="font-display px-6 text-base tracking-tight md:text-lg">
                  {item}
                </span>
                {sep}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-16 ${fades.left}`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 right-0 w-16 ${fades.right}`}
      />
    </div>
  );
}
