import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 28): React.SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round"
});

export function CompassIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <circle cx="32" cy="32" r="22" />
      <circle cx="32" cy="32" r="2" />
      <path d="M32 14v4M32 46v4M14 32h4M46 32h4" />
      <path d="M32 18l5 17-5-3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FlameIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M32 8c-3 6 5 10 0 16-3 4-9 7-9 14a14 14 0 0 0 28 0c0-7-5-10-7-13-2-3-1-7-3-12-2-2-6-3-9-5z" />
      <path d="M30 36c-2 2-4 5-4 9 0 4 4 7 6 7" />
    </svg>
  );
}

export function KnotIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M16 18c8 0 14 6 14 14s-6 14-14 14" />
      <path d="M48 46c-8 0-14-6-14-14s6-14 14-14" />
      <path d="M22 22c8 6 12 14 20 20" />
      <path d="M42 22c-8 6-12 14-20 20" />
    </svg>
  );
}

export function KnifeIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M10 40 Q 32 12 54 24 L 50 30 Q 30 22 14 44 Z" />
      <path d="M14 44l-4 6 6-2" />
    </svg>
  );
}

export function BowIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M14 10c14 6 22 18 22 32" />
      <path d="M14 10c14 6 22 18 22 32" transform="rotate(180 32 32)" />
      <path d="M14 10l44 44" />
      <path d="M14 10l8 0M14 10l0 8" />
      <path d="M58 54l-8 0M58 54l0-8" />
    </svg>
  );
}

export function LeafIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M14 50 Q 14 14 50 14 Q 50 50 14 50 Z" />
      <path d="M14 50 L 44 20" />
    </svg>
  );
}

export function TentIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M8 50 L 32 12 L 56 50 Z" />
      <path d="M32 12 L 32 50" />
      <path d="M24 50 L 32 38 L 40 50" />
    </svg>
  );
}

export function CanoeIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 36 Q 32 50 58 36 L 56 38 Q 32 48 8 38 Z" />
      <path d="M14 38 L 14 30 M 50 38 L 50 30" />
      <path d="M22 14 L 26 30 M 36 30 L 40 14" />
    </svg>
  );
}

export function MoonIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M44 12 A 22 22 0 1 0 52 38 A 16 16 0 0 1 44 12 Z" />
    </svg>
  );
}

export function BookIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M12 12h28a8 8 0 0 1 8 8v32H20a8 8 0 0 1-8-8z" />
      <path d="M48 20a8 8 0 0 0-8-8H12" />
    </svg>
  );
}

export function WaveIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 22 Q 16 14 26 22 T 46 22 T 66 22" />
      <path d="M6 34 Q 16 26 26 34 T 46 34 T 66 34" />
      <path d="M6 46 Q 16 38 26 46 T 46 46 T 66 46" />
    </svg>
  );
}

export function HandIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M22 30V14a4 4 0 0 1 8 0v14" />
      <path d="M30 28V10a4 4 0 0 1 8 0v18" />
      <path d="M38 28V14a4 4 0 0 1 8 0v22" />
      <path d="M46 28V18a4 4 0 0 1 8 0v22c0 8-6 14-14 14h-6c-6 0-10-3-14-9l-6-10c-2-3 1-7 5-5l5 4" />
    </svg>
  );
}

export function SparkIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M32 8v12M32 44v12M8 32h12M44 32h12M16 16l8 8M40 40l8 8M16 48l8-8M40 24l8-8" />
    </svg>
  );
}

const iconMap = {
  compass: CompassIcon,
  flame: FlameIcon,
  knot: KnotIcon,
  knife: KnifeIcon,
  bow: BowIcon,
  leaf: LeafIcon,
  tent: TentIcon,
  canoe: CanoeIcon,
  moon: MoonIcon,
  book: BookIcon,
  wave: WaveIcon,
  hand: HandIcon,
  spark: SparkIcon
} as const;

export type CampIconName = keyof typeof iconMap;

export function CampIcon({ name, ...props }: { name: CampIconName } & IconProps) {
  const C = iconMap[name];
  return <C {...props} />;
}

export function TopoDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      className={`block h-12 w-full ${className ?? "text-camp-bark/25"}`}
      aria-hidden
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M0 50 Q 200 20 420 42 T 820 38 T 1200 46" />
        <path d="M0 64 Q 220 36 440 56 T 840 50 T 1200 60" />
        <path d="M0 30 Q 180 10 400 22 T 820 18 T 1200 24" />
      </g>
    </svg>
  );
}

export function PaintedDivider({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 24"
      preserveAspectRatio="none"
      className={`block h-3 w-full ${className ?? "text-camp-flame/70"}`}
      aria-hidden
    >
      <path
        d="M0 12 Q 80 4 200 12 T 480 12 T 760 12 T 1040 12 T 1200 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
