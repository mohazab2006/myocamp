import Link from "next/link";
import { ArrowRight, Compass, UsersThree } from "@phosphor-icons/react/ssr";
import { formatRange } from "@/lib/date";
import {
  CampIcon,
  PaintedDivider,
  SectionScatter,
  type CampIconName
} from "@/components/camp/Illustrations";
import type { PublicCamp } from "@/lib/content/camps-public";

type CampRegisterSelectorProps = {
  camps: PublicCamp[];
};

const CARD_ICONS: CampIconName[] = ["tent", "flame", "lantern", "compass", "canoe", "star"];

function statusLabel(camp: PublicCamp): { text: string; tone: string } {
  if (camp.registrationStatus === "open") {
    return { text: "Open — spots available", tone: "bg-camp-moss text-camp-paper" };
  }
  if (camp.registrationStatus === "full") {
    return { text: "Full — join waitlist", tone: "bg-camp-bark text-camp-paper" };
  }
  return { text: camp.registrationStatus, tone: "bg-camp-bark/70 text-camp-paper" };
}

function sessionNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function CampRegisterSelector({ camps }: CampRegisterSelectorProps) {
  const gridCols =
    camps.length === 1
      ? "md:grid-cols-1"
      : camps.length === 2
        ? "md:grid-cols-2"
        : "md:grid-cols-2 lg:grid-cols-3";

  return (
    <>
      <section className="topo-bg relative isolate overflow-hidden bg-camp-paper">
        <SectionScatter variant="route" />
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-flame">choose your session</div>
            <h1 className="font-camp mt-2 text-6xl leading-[0.92] text-camp-bark md:text-8xl">
              Which camp are you{" "}
              <span className="scribble-underline">registering for?</span>
            </h1>
            <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-camp-ink/85">
              More than one session is open right now. Choose which camp you&apos;re registering for —
              each session has its own form, reference code, and payment link.
            </p>
            <div className="mt-8 flex items-center gap-3 text-camp-bark/70">
              <Compass size={28} weight="duotone" className="shrink-0 text-camp-flame" />
              <p className="font-script text-xl">
                {camps.length} session{camps.length === 1 ? "" : "s"} open · tap a card to continue
              </p>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5">
            <div className="relative border-2 border-camp-bark/30 bg-camp-paper-soft p-6 md:rotate-1">
              <div className="absolute -right-2 -top-3 -rotate-2 bg-camp-flame px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-camp-paper">
                quick tip
              </div>
              <div className="font-script text-xl text-camp-flame">not sure?</div>
              <p className="mt-2 leading-relaxed text-camp-ink/85">
                Make sure you pick the right camp session. If you already got a direct link from us,
                you can use that too — you&apos;ll land on the correct form either way.
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center gap-2 font-camp text-lg text-camp-flame underline decoration-2 underline-offset-4 transition hover:text-camp-bark"
              >
                Ask us which session
                <ArrowRight size={18} weight="bold" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <PaintedDivider />

      <section className="relative isolate overflow-hidden bg-camp-paper-soft">
        <SectionScatter variant="forest" />
        <div className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 md:py-24">
          <div className="text-center md:text-left">
            <div className="font-script text-2xl text-camp-flame">summer sessions</div>
            <h2 className="font-camp mt-1 text-4xl text-camp-bark md:text-5xl">
              Pick your track.
            </h2>
          </div>

          <ul className={`mt-10 grid gap-6 ${gridCols}`}>
            {camps.map((camp, i) => {
              const badge = statusLabel(camp);
              const icon = CARD_ICONS[i % CARD_ICONS.length];
              const isOpen = camp.registrationStatus === "open";
              const isWaitlist = camp.registrationStatus === "full";

              return (
                <li key={camp.id}>
                  <Link
                    href={camp.registerPath}
                    className="group relative flex h-full flex-col overflow-hidden border-2 border-camp-bark/30 bg-camp-paper transition duration-300 hover:-rotate-1 hover:border-camp-flame hover:shadow-[6px_6px_0_0_rgba(180,83,9,0.25)]"
                    style={{ rotate: `${i % 2 ? 0.5 : -0.5}deg` }}
                  >
                    {camp.heroImage ? (
                      <div className="relative aspect-video overflow-hidden border-b-2 border-dashed border-camp-bark/25">
                        <img
                          src={camp.heroImage}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                        {isOpen ? (
                          <div className="absolute right-4 top-4 rotate-3 bg-camp-moss px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-camp-paper">
                            registering
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="relative border-b-2 border-dashed border-camp-bark/25 bg-camp-paper-soft px-6 py-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-script text-base text-camp-amber">
                            session {sessionNumber(i)}
                          </div>
                          <p className="font-script mt-1 text-xl text-camp-flame">
                            {formatRange(camp.startDate, camp.endDate)}
                          </p>
                        </div>
                        {!camp.heroImage ? (
                          <div className="text-camp-flame/80 transition group-hover:scale-110 group-hover:text-camp-flame">
                            <CampIcon name={icon} size={48} />
                          </div>
                        ) : null}
                      </div>
                      {!camp.heroImage && isOpen ? (
                        <div className="absolute right-4 top-4 rotate-3 bg-camp-moss px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-camp-paper">
                          registering
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${badge.tone}`}
                        >
                          {badge.text}
                        </span>
                        {camp.location ? (
                          <span className="text-xs text-camp-ink/60">{camp.location}</span>
                        ) : null}
                      </div>

                      <h3 className="font-camp mt-3 text-3xl leading-tight text-camp-bark transition group-hover:text-camp-flame md:text-4xl">
                        {camp.title}
                      </h3>

                      <p className="mt-3 flex-1 text-sm leading-relaxed text-camp-ink/80">
                        ${camp.feePerCamper.toFixed(0)} per camper
                        {isWaitlist ? " · waitlist only" : isOpen ? " · spots available" : ""}
                        {camp.registrationClosesAt
                          ? ` · closes ${new Date(camp.registrationClosesAt).toLocaleDateString("en-CA", {
                              month: "short",
                              day: "numeric"
                            })}`
                          : ""}
                      </p>

                      <div className="mt-6 flex items-center justify-between border-t border-dashed border-camp-bark/30 pt-4">
                        <span className="font-camp text-xl text-camp-flame">
                          {isWaitlist ? "Join waitlist" : isOpen ? "Register now" : "View session"}
                        </span>
                        <span className="flex items-center gap-2 font-camp text-2xl text-camp-flame transition group-hover:translate-x-1">
                          <UsersThree size={22} weight="duotone" />
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-camp-bark text-camp-paper">
        <SectionScatter variant="dark" />
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-20">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-amber">what happens next</div>
            <h2 className="font-camp mt-2 text-4xl leading-[0.95] md:text-5xl">
              Form → email → pay.
            </h2>
            <p className="mt-4 max-w-[52ch] text-camp-paper/85">
              After you pick a session and submit the form, you&apos;re redirected to pay right away —
              reference code included. We&apos;ll email a backup copy too.
            </p>
          </div>
          <div className="col-span-12 flex flex-col justify-center gap-4 md:col-span-5">
            {[
              { step: "01", label: "Choose your session above" },
              { step: "02", label: "Fill out the registration form" },
              { step: "03", label: "Pay on the next screen (or from email)" }
            ].map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-4 border-b border-camp-paper/20 pb-3 last:border-0"
              >
                <span className="font-script text-lg text-camp-amber">step {item.step}</span>
                <span className="font-camp text-xl">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/** Compact banner shown on a single-camp register page when other sessions are also open. */
export function CampSwitchBanner({
  currentSlug,
  otherCamps
}: {
  currentSlug: string;
  otherCamps: PublicCamp[];
}) {
  const others = otherCamps.filter((c) => c.slug !== currentSlug);
  if (others.length === 0) return null;

  return (
    <div className="relative border-b-2 border-camp-flame/50 bg-camp-amber/25 px-6 py-3.5 text-center text-sm text-camp-ink">
      <Compass
        size={18}
        weight="duotone"
        className="mr-1.5 inline-block -translate-y-px text-camp-flame"
      />
      <span className="text-camp-bark/85">Registering for the wrong session?</span>{" "}
      <Link
        href="/camp/register"
        className="font-camp text-base text-camp-flame underline decoration-2 underline-offset-2 transition hover:text-camp-bark"
      >
        Choose a different camp ({others.length + 1} open)
      </Link>
    </div>
  );
}
