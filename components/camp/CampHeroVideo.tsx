"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const VIDEO_SRC = "/Pictures/MYO%20New%20Camps.mp4";

type CampVideoProps = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
};

function CampVideo({ videoRef }: CampVideoProps) {
  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      className="h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      controls
      preload="auto"
      aria-label="MYO Summer Camp overview video"
    />
  );
}

export function CampHeroVideo() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inlineVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  const [isPip, setIsPip] = useState(false);
  const [pipDismissed, setPipDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const showPip = isPip && !pipDismissed;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPip(false);
          setPipDismissed(false);
        } else if (!pipDismissed) {
          setIsPip(true);
        }
      },
      { threshold: 0, rootMargin: "-40px 0px 0px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pipDismissed]);

  useEffect(() => {
    if (!mounted) return;

    let frame = 0;

    const syncToPip = () => {
      const inline = inlineVideoRef.current;
      const pip = pipVideoRef.current;
      if (!inline || !pip) {
        frame = requestAnimationFrame(syncToPip);
        return;
      }
      pip.currentTime = inline.currentTime;
      pip.muted = inline.muted;
      inline.pause();
      void pip.play().catch(() => {});
    };

    const syncToInline = () => {
      const inline = inlineVideoRef.current;
      const pip = pipVideoRef.current;
      if (!inline) return;
      if (pip && pip.currentTime > 0) {
        inline.currentTime = pip.currentTime;
        inline.muted = pip.muted;
        pip.pause();
      }
      void inline.play().catch(() => {});
    };

    if (showPip) {
      syncToPip();
    } else {
      syncToInline();
    }

    return () => cancelAnimationFrame(frame);
  }, [showPip, mounted]);

  const handleDismiss = useCallback(() => {
    setPipDismissed(true);
    setIsPip(false);
    pipVideoRef.current?.pause();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        className="camp-hero-video mx-auto mt-5 w-full max-w-[min(100%,20rem)] px-1 sm:mt-6 sm:max-w-sm md:mt-8 md:max-w-md md:px-0"
      >
        <div
          className={`relative mx-auto aspect-video w-full overflow-hidden rounded-xl border-2 border-camp-bark/25 bg-camp-bark/5 shadow-[0_8px_24px_rgba(45,35,25,0.12)] ${showPip ? "invisible" : ""}`}
        >
          <CampVideo videoRef={inlineVideoRef} />
        </div>
      </div>

      {mounted && showPip
        ? createPortal(
            <div
              className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-9999 aspect-video w-[min(240px,72vw)] overflow-hidden rounded-xl border-2 border-camp-bark/30 bg-camp-bark shadow-[0_12px_40px_rgba(45,35,25,0.35)] sm:bottom-6 sm:right-6 sm:w-[min(280px,42vw)]"
              role="dialog"
              aria-label="Camp video mini player"
            >
              <CampVideo videoRef={pipVideoRef} />
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Close mini player"
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-camp-paper/40 bg-camp-bark/85 text-sm font-medium text-camp-paper transition hover:border-camp-flame hover:bg-camp-flame"
              >
                ×
              </button>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
