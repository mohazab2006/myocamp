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

export function ArrowIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M8 32 L 52 32" />
      <path d="M44 24 L 56 32 L 44 40" />
      <path d="M8 32 L 14 26 M 8 32 L 14 38" />
      <path d="M16 28 L 12 32 L 16 36" />
    </svg>
  );
}

export function PaddleIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M32 6 Q 22 12 22 22 Q 22 32 32 34 Q 42 32 42 22 Q 42 12 32 6 Z" />
      <path d="M32 34 L 32 58" />
      <path d="M28 56 L 32 60 L 36 56" />
    </svg>
  );
}

export function MountainIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M6 50 L 22 22 L 32 36 L 44 14 L 58 50 Z" />
      <path d="M18 28 L 22 22 L 26 28" />
      <path d="M40 20 L 44 14 L 48 20" />
    </svg>
  );
}

export function FishIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M10 32 Q 24 18 42 32 Q 24 46 10 32 Z" />
      <path d="M42 32 L 56 22 L 54 32 L 56 42 Z" />
      <circle cx="18" cy="30" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function AcornIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M16 24 Q 32 14 48 24 Q 48 30 32 30 Q 16 30 16 24 Z" />
      <path d="M20 30 Q 22 50 32 54 Q 42 50 44 30" />
      <path d="M32 14 L 32 8" />
    </svg>
  );
}

export function StarIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M32 10 L 37 26 L 54 26 L 40 36 L 45 52 L 32 42 L 19 52 L 24 36 L 10 26 L 27 26 Z" />
    </svg>
  );
}

export function LanternIcon({ size, ...props }: IconProps) {
  return (
    <svg {...base(size)} {...props}>
      <path d="M26 14 L 38 14 L 38 18 L 42 18 L 42 22 L 22 22 L 22 18 L 26 18 Z" />
      <path d="M24 22 Q 18 32 22 44 Q 28 52 32 52 Q 36 52 42 44 Q 46 32 40 22 Z" />
      <path d="M28 30 L 28 44 M 36 30 L 36 44" />
      <path d="M32 6 L 32 14" />
      <path d="M32 52 L 32 58" />
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
  spark: SparkIcon,
  arrow: ArrowIcon,
  paddle: PaddleIcon,
  mountain: MountainIcon,
  fish: FishIcon,
  acorn: AcornIcon,
  star: StarIcon,
  lantern: LanternIcon
} as const;

export type CampIconName = keyof typeof iconMap;

export function CampIcon({ name, ...props }: { name: CampIconName } & IconProps) {
  const C = iconMap[name];
  return <C {...props} />;
}

type ScatterItem = {
  name: CampIconName;
  size: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate?: number;
  tone: string;
};

const scatterVariants = {
  forest: [
    { name: "leaf",     size: 44, top: "8%",   left: "3%",   rotate: -18, tone: "text-camp-moss/25" },
    { name: "mountain", size: 64, top: "14%",  right: "5%",  rotate: 4,   tone: "text-camp-moss/20" },
    { name: "acorn",    size: 32, top: "38%",  left: "7%",   rotate: 12,  tone: "text-camp-bark/20" },
    { name: "leaf",     size: 36, top: "60%",  right: "4%",  rotate: 28,  tone: "text-camp-moss/25" },
    { name: "compass",  size: 52, bottom: "8%",  left: "10%",  rotate: -8,  tone: "text-camp-bark/15" },
    { name: "arrow",    size: 42, bottom: "20%", right: "12%", rotate: -16, tone: "text-camp-bark/20" },
    { name: "star",     size: 16, top: "26%",  left: "22%",  tone: "text-camp-amber/40" },
    { name: "spark",    size: 18, bottom: "32%", right: "8%",  tone: "text-camp-flame/25" },
    { name: "leaf",     size: 26, bottom: "6%",  left: "30%",  rotate: -34, tone: "text-camp-moss/20" }
  ],
  firey: [
    { name: "flame",   size: 52, top: "10%",  left: "5%",  rotate: -10, tone: "text-camp-flame/25" },
    { name: "lantern", size: 46, top: "22%",  right: "7%", rotate: -4,  tone: "text-camp-flame/25" },
    { name: "spark",   size: 22, top: "48%",  left: "14%", tone: "text-camp-flame/30" },
    { name: "star",    size: 18, top: "8%",   right: "22%", tone: "text-camp-amber/40" },
    { name: "knot",    size: 50, bottom: "12%", left: "6%",  rotate: 10,  tone: "text-camp-bark/18" },
    { name: "moon",    size: 36, bottom: "28%", right: "5%", rotate: 14,  tone: "text-camp-bark/18" },
    { name: "flame",   size: 36, bottom: "6%",  right: "16%", rotate: 6,   tone: "text-camp-flame/22" },
    { name: "spark",   size: 14, top: "36%",  right: "3%", tone: "text-camp-flame/25" },
    { name: "star",    size: 14, bottom: "40%", left: "28%", tone: "text-camp-amber/35" }
  ],
  water: [
    { name: "canoe",   size: 64, top: "12%",  left: "4%",   rotate: -6, tone: "text-camp-moss/22" },
    { name: "paddle",  size: 46, top: "28%",  right: "6%",  rotate: 26, tone: "text-camp-moss/22" },
    { name: "fish",    size: 36, top: "52%",  left: "10%",  rotate: -14, tone: "text-camp-bark/18" },
    { name: "wave",    size: 60, bottom: "18%", right: "8%",  tone: "text-camp-moss/25" },
    { name: "compass", size: 38, top: "8%",   right: "18%", rotate: 8,  tone: "text-camp-bark/18" },
    { name: "wave",    size: 80, top: "42%",  left: "22%",  tone: "text-camp-moss/15" },
    { name: "arrow",   size: 36, bottom: "10%", left: "14%",  rotate: 32, tone: "text-camp-flame/22" },
    { name: "star",    size: 14, bottom: "30%", right: "24%", tone: "text-camp-amber/35" },
    { name: "fish",    size: 22, bottom: "6%",  right: "32%", rotate: 22, tone: "text-camp-bark/15" }
  ],
  route: [
    { name: "compass", size: 56, top: "10%",  left: "6%",   rotate: -6, tone: "text-camp-bark/22" },
    { name: "arrow",   size: 52, top: "30%",  right: "7%",  rotate: -20, tone: "text-camp-bark/18" },
    { name: "knot",    size: 44, top: "55%",  left: "4%",   rotate: 14, tone: "text-camp-moss/22" },
    { name: "bow",     size: 56, bottom: "12%", right: "9%",  rotate: -24, tone: "text-camp-amber/30" },
    { name: "moon",    size: 32, top: "14%",  right: "20%", rotate: 18, tone: "text-camp-bark/18" },
    { name: "acorn",   size: 28, bottom: "24%", left: "16%",  rotate: 10, tone: "text-camp-bark/20" },
    { name: "spark",   size: 18, bottom: "5%",  right: "26%", tone: "text-camp-flame/25" },
    { name: "star",    size: 14, top: "4%",   left: "26%",  tone: "text-camp-amber/40" },
    { name: "tent",    size: 40, bottom: "6%",  left: "28%",  rotate: -4, tone: "text-camp-moss/22" }
  ],
  dark: [
    { name: "flame",   size: 48, top: "8%",   left: "5%",   rotate: -8, tone: "text-camp-amber/25" },
    { name: "compass", size: 56, top: "22%",  right: "7%",  rotate: 10, tone: "text-camp-amber/15" },
    { name: "star",    size: 18, top: "5%",   right: "22%", tone: "text-camp-amber/40" },
    { name: "moon",    size: 36, bottom: "18%", left: "12%",  rotate: 14, tone: "text-camp-paper/15" },
    { name: "lantern", size: 42, bottom: "10%", right: "10%", rotate: -6, tone: "text-camp-amber/25" },
    { name: "spark",   size: 20, top: "52%",  right: "14%", tone: "text-camp-amber/30" },
    { name: "knot",    size: 44, bottom: "32%", left: "5%",   rotate: 18, tone: "text-camp-paper/12" },
    { name: "leaf",    size: 30, top: "62%",  left: "16%",  rotate: -24, tone: "text-camp-amber/20" },
    { name: "star",    size: 12, bottom: "6%",  right: "34%", tone: "text-camp-amber/35" }
  ]
} as const satisfies Record<string, ScatterItem[]>;

export type ScatterVariant = keyof typeof scatterVariants;

export function SectionScatter({ variant = "forest" }: { variant?: ScatterVariant }) {
  const items: ScatterItem[] = scatterVariants[variant];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden"
    >
      {items.map((item, i) => {
        const Icon = iconMap[item.name];
        return (
          <Icon
            key={`${variant}-${i}`}
            size={item.size}
            className={`absolute ${item.tone}`}
            style={{
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              transform: item.rotate ? `rotate(${item.rotate}deg)` : undefined
            }}
          />
        );
      })}
    </div>
  );
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
