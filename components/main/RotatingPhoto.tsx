"use client";

import { useEffect, useState } from "react";

export function useRotator(length: number, intervalMs: number, offsetMs = 0) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (length <= 1) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setIdx((i) => (i + 1) % length);
      }, intervalMs);
    }, offsetMs);
    return () => {
      clearTimeout(start);
      if (interval) clearInterval(interval);
    };
  }, [length, intervalMs, offsetMs]);

  return idx;
}

export type RotatingSlide = {
  src: string;
  alt?: string;
  objectPosition?: string;
};

type RotatingPhotoProps = {
  images: Array<string | RotatingSlide>;
  intervalMs?: number;
  offsetMs?: number;
  transitionMs?: number;
  alt?: string;
  className?: string;
  imgClassName?: string;
};

function toSlide(item: string | RotatingSlide): RotatingSlide {
  return typeof item === "string" ? { src: item } : item;
}

export function RotatingPhoto({
  images,
  intervalMs = 4500,
  offsetMs = 0,
  transitionMs = 1200,
  alt = "",
  className,
  imgClassName
}: RotatingPhotoProps) {
  const slides = images.map(toSlide);
  const idx = useRotator(slides.length, intervalMs, offsetMs);

  return (
    <div className={`relative h-full w-full overflow-hidden ${className ?? ""}`}>
      {slides.map((slide, i) => {
        const isActive = i === idx;
        return (
          <img
            key={slide.src}
            src={slide.src}
            alt={isActive ? slide.alt ?? alt : ""}
            aria-hidden={!isActive}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover ${imgClassName ?? ""}`}
            style={{
              opacity: isActive ? 1 : 0,
              objectPosition: slide.objectPosition ?? "center",
              transition: `opacity ${transitionMs}ms ease-in-out`
            }}
          />
        );
      })}
    </div>
  );
}
