"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const moments = [
  {
    title: "Wake to the tree line",
    image: "/Pictures/trails.jpg",
    copy: "Mornings start with prayer, breakfast, cabin duties, and the kind of fresh-air reset that changes the rhythm of the whole week."
  },
  {
    title: "Move through the lake",
    image: "/Pictures/canoes.jpg",
    copy: "Canoeing, swimming, and waterfront time are supervised with life jackets, lifeguards, and trained staff watching the details."
  },
  {
    title: "Build the cabin circle",
    image: "/Pictures/bFirePit.jpg",
    copy: "Campfire nights, social hour, and group reflection give campers a place to make friendships that outlast the summer."
  },
  {
    title: "Practice leadership",
    image: "/Pictures/assembly.jpg",
    copy: "Campers and LITs learn responsibility through workshops, camp-wide games, service, discussion, and daily worship together."
  }
];

export function CampExperience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 900px)"
        },
        (context) => {
          const { reduceMotion, desktop } = context.conditions || {};

          if (reduceMotion) {
            gsap.set(".motion-item", { autoAlpha: 1, y: 0, scale: 1 });
            return;
          }

          gsap.from(".motion-item", {
            y: 56,
            autoAlpha: 0,
            scale: 0.96,
            duration: 1,
            ease: "expo.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: ".experience-grid",
              start: "top 78%",
              toggleActions: "play none none reverse"
            }
          });

          gsap.utils.toArray<HTMLElement>(".experience-photo").forEach((photo) => {
            gsap.fromTo(
              photo,
              { scale: 0.86, autoAlpha: 0.7 },
              {
                scale: 1,
                autoAlpha: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: photo,
                  start: "top bottom",
                  end: "bottom 35%",
                  scrub: 0.8
                }
              }
            );
          });

          if (desktop) {
            ScrollTrigger.create({
              trigger: ".experience-shell",
              start: "top top",
              end: "bottom bottom",
              pin: ".experience-copy",
              pinSpacing: false
            });
          }
        }
      );

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="experience" ref={root} className="experience-shell">
      <div className="experience-copy">
        <p className="eyebrow">Camp life</p>
        <h2>One week outside, built around care and character.</h2>
        <p>
          The week mixes worship, skill-building, recreation, cabin duties, and time in the woods. It feels active and joyful, but it is held by practical systems parents can trust.
        </p>
      </div>

      <div className="experience-grid">
        {moments.map((moment) => (
          <article className="motion-item experience-card" key={moment.title}>
            <div className="experience-photo-wrap">
              <img className="experience-photo" src={moment.image} alt={moment.title} />
            </div>
            <div>
              <h3>{moment.title}</h3>
              <p>{moment.copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
