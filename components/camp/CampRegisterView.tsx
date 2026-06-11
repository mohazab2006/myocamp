import Link from "next/link";
import { Envelope, HandCoins, Wallet } from "@phosphor-icons/react/ssr";
import { formatRange } from "@/lib/date";
import { PaintedDivider, SectionScatter } from "@/components/camp/Illustrations";
import {
  activeFormForCamp,
  jotformEmbedUrl,
  type PublicCamp,
  type PublicRegistrationStatus
} from "@/lib/content/camps-public";
import { CampSwitchBanner } from "@/components/camp/CampRegisterSelector";

const statusCopy: Record<
  PublicRegistrationStatus,
  { tag: string; tone: string; line: string }
> = {
  open: {
    tag: "Open now",
    tone: "bg-camp-moss text-camp-paper",
    line: "Spots are available — register below."
  },
  full: {
    tag: "Waitlist",
    tone: "bg-camp-bark text-camp-paper",
    line: "We're at capacity. Join the waitlist and we'll email you if a spot opens."
  },
  closed: {
    tag: "Closed",
    tone: "bg-camp-bark/70 text-camp-paper",
    line: "Registration is closed for this session."
  },
  "opening-soon": {
    tag: "Opening soon",
    tone: "bg-camp-flame text-camp-paper",
    line: "Registration isn't open yet — check back soon."
  }
};

type CampRegisterViewProps = {
  camp: PublicCamp;
  siteOrigin: string;
  /** When multiple camps are open, show a link back to the picker. */
  otherOpenCamps?: PublicCamp[];
  currentSlug?: string;
};

export function CampRegisterView({
  camp,
  siteOrigin,
  otherOpenCamps,
  currentSlug
}: CampRegisterViewProps) {
  const status = statusCopy[camp.registrationStatus];
  const { formId, mode } = activeFormForCamp(camp);
  const parentUrl = `${siteOrigin}${camp.registerPath}`;
  const formUrl = formId ? jotformEmbedUrl(formId, parentUrl) : null;

  return (
    <>
      {otherOpenCamps && otherOpenCamps.length > 1 && currentSlug ? (
        <CampSwitchBanner currentSlug={currentSlug} otherCamps={otherOpenCamps} />
      ) : null}
      <section className="topo-bg relative isolate overflow-hidden bg-camp-paper">
        <SectionScatter variant="route" />
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-4 py-20 sm:px-6 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-flame">paperwork, the easy version</div>
            <h1 className="font-camp mt-2 text-6xl leading-[0.92] text-camp-bark md:text-8xl">
              Register for {camp.title}.
            </h1>
            <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-camp-ink/85">
              Submit the form below. You&apos;ll go straight to the payment page with your reference
              code — PayPal, e-Transfer, or cash at drop-off. We&apos;ll also email a confirmation if
              we have your address. E-transfers go to{" "}
              <a href={`mailto:${camp.paymentEmail}`} className="text-camp-flame underline">
                {camp.paymentEmail}
              </a>
              .
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${status.tone}`}>
                {status.tag}
              </span>
              <span className="font-script text-xl text-camp-bark/80">{status.line}</span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5">
            <div className="space-y-3">
              {[
                ["Session", formatRange(camp.startDate, camp.endDate)],
                ["Fee", `$${camp.feePerCamper.toFixed(0)} per camper`],
                ...(camp.location ? [["Location", camp.location] as const] : []),
                ...(camp.registrationClosesAt
                  ? [
                      [
                        "Registration closes",
                        new Date(camp.registrationClosesAt).toLocaleString("en-CA", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit"
                        })
                      ] as const
                    ]
                  : [])
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-baseline justify-between border-b border-dashed border-camp-bark/40 pb-2"
                >
                  <span className="font-script text-lg text-camp-bark/70">{k}</span>
                  <span className="font-camp text-xl text-camp-bark">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PaintedDivider />

      <section className="relative isolate overflow-hidden bg-camp-paper-soft">
        <SectionScatter variant="firey" />
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-4 py-16 sm:px-6 md:gap-10 md:px-10 md:py-20">
          <div className="col-span-12 md:col-span-4">
            <div className="font-script text-2xl text-camp-flame">how to pay</div>
            <h2 className="font-camp mt-2 text-4xl text-camp-bark md:text-5xl">Three ways.</h2>
            <p className="mt-4 text-camp-ink/80">
              After you register, use the payment page right away (or the link in your confirmation
              email). Include your reference code in every e-Transfer memo.
            </p>
          </div>
          <div className="col-span-12 grid gap-5 md:col-span-8 md:grid-cols-3">
            <div className="relative flex flex-col gap-3 border-2 border-camp-flame/60 bg-camp-paper p-6">
              <div className="absolute -right-2 -top-3 rotate-3 bg-camp-flame px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-camp-paper">
                preferred
              </div>
              <Envelope size={32} weight="duotone" className="text-camp-flame" />
              <div className="font-camp text-2xl text-camp-bark">E-Transfer</div>
              <p className="text-camp-ink/80">
                Send to{" "}
                <a className="text-camp-flame underline" href={`mailto:${camp.paymentEmail}`}>
                  {camp.paymentEmail}
                </a>
                . Put your reference code in the memo.
              </p>
            </div>
            <div className="flex flex-col gap-3 border-2 border-camp-bark/30 bg-camp-paper p-6">
              <HandCoins size={32} weight="duotone" className="text-camp-flame" />
              <div className="font-camp text-2xl text-camp-bark">Cash at drop-off</div>
              <p className="text-camp-ink/80">Choose &quot;I&apos;ll bring cash&quot; on the payment page.</p>
            </div>
            <div className="flex flex-col gap-3 border-2 border-camp-bark/30 bg-camp-paper p-6">
              <Wallet size={32} weight="duotone" className="text-camp-flame" />
              <div className="font-camp text-2xl text-camp-bark">PayPal</div>
              <p className="text-camp-ink/80">One-click on the payment page if e-Transfer isn&apos;t an option.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-camp-paper">
        <SectionScatter variant="forest" />
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 md:px-10 md:py-16">
          <div className="font-script text-center text-2xl text-camp-flame">the form</div>
          <h2 className="font-camp mt-1 text-center text-4xl text-camp-bark md:text-5xl">
            {mode === "waitlist" ? "Join the waitlist." : "Fill this out per camper."}
          </h2>

          {formUrl ? (
            <>
              <div className="mt-8 overflow-hidden border-2 border-camp-bark/30 bg-camp-paper-soft">
                <iframe
                  title={mode === "waitlist" ? "MYO Camp waitlist form" : "MYO Camp registration form"}
                  src={formUrl}
                  loading="lazy"
                  className="block h-[1200px] w-full"
                />
              </div>
              <p className="mt-4 text-center text-sm text-camp-ink/65">
                Trouble loading?{" "}
                <a href={formUrl} target="_blank" rel="noopener" className="text-camp-flame underline">
                  Open in a new tab
                </a>
                .
              </p>
            </>
          ) : (
            <div className="mx-auto mt-8 max-w-xl border-2 border-camp-bark/30 bg-camp-paper-soft p-8 text-center">
              <p className="font-camp text-2xl text-camp-bark">Registration isn&apos;t open right now.</p>
              <p className="mt-3 text-camp-ink/80">
                {camp.registrationStatus === "full"
                  ? "Registration is full, but you can still join the waitlist below."
                  : camp.status === "closed"
                    ? "This session is closed. Contact us if you have questions."
                    : "Check back soon or email us for help."}
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-block font-camp text-xl text-camp-flame underline decoration-2 underline-offset-4"
              >
                Contact us →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
