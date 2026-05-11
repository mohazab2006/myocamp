import type { Metadata } from "next";
import { Envelope, HandCoins, NotePencil, Wallet } from "@phosphor-icons/react/ssr";
import { getCampSettings } from "@/lib/content/camp";
import { formatRange } from "@/lib/date";
import { PaintedDivider, SectionScatter } from "@/components/camp/Illustrations";

export const metadata: Metadata = {
  title: "Camp · Register",
  description: "Register for the MYO Summer Camp at Camp Smitty."
};

const statusCopy: Record<string, { tag: string; tone: string; line: string }> = {
  open: { tag: "Open now", tone: "bg-camp-moss text-camp-paper", line: "Spots are available — register before the deadline." },
  full: { tag: "Full", tone: "bg-camp-bark text-camp-paper", line: "We&apos;ve hit capacity. Email to be added to the waitlist." },
  closed: { tag: "Closed", tone: "bg-camp-bark/70 text-camp-paper", line: "Registration is closed for this cycle." },
  "opening-soon": { tag: "Opening soon", tone: "bg-camp-flame text-camp-paper", line: "Registration is not open yet — sign up for our list to be first to know." }
};

export default async function CampRegisterPage() {
  const camp = await getCampSettings();
  const status = statusCopy[camp.registrationStatus];

  return (
    <>
      <section className="topo-bg relative isolate overflow-hidden bg-camp-paper">
        <SectionScatter variant="route" />
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-20 md:gap-10 md:px-10 md:py-28">
          <div className="col-span-12 md:col-span-7">
            <div className="font-script text-2xl text-camp-flame">paperwork, the easy version</div>
            <h1 className="font-camp mt-2 text-6xl leading-[0.92] text-camp-bark md:text-8xl">
              Register a camper.
            </h1>
            <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-camp-ink/85">
              One form per camper. Don&apos;t pay until your spot is confirmed — we&apos;ll email you within 48
              hours. Email-money-transfers go to{" "}
              <a href={`mailto:${camp.paymentEmail}`} className="text-camp-flame underline">
                {camp.paymentEmail}
              </a>
              .
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${status.tone}`}>
                {status.tag}
              </span>
              <span
                className="font-script text-xl text-camp-bark/80"
                dangerouslySetInnerHTML={{ __html: status.line }}
              />
            </div>
          </div>

          <div className="col-span-12 md:col-span-5">
            <div className="space-y-3">
              {[
                ["Main camp", formatRange(camp.campStart, camp.campEnd)],
                ...(camp.litStart && camp.litEnd
                  ? [["LIT session", formatRange(camp.litStart, camp.litEnd)] as const]
                  : []),
                ["Staff arrival", camp.staffArrival],
                [
                  "Registration window",
                  camp.registrationOpens && camp.registrationDeadline
                    ? `${formatRange(camp.registrationOpens)} – ${formatRange(camp.registrationDeadline)}`
                    : "—"
                ],
                ["Camper fee", `$${camp.feeCamper} (ages 9 – 16)`],
                ["LIT fee", `$${camp.feeLit} (ages 17 – 19)`],
                ["Drop-off", camp.dropOff],
                ["Pickup", camp.pickUp]
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
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-20">
          <div className="col-span-12 md:col-span-4">
            <div className="font-script text-2xl text-camp-flame">how to pay</div>
            <h2 className="font-camp mt-2 text-4xl text-camp-bark md:text-5xl">Four ways, in order.</h2>
            <p className="mt-4 text-camp-ink/80">
              Wait for confirmation before sending payment. We confirm spots first, then collect.
            </p>
            <div className="mt-5 border-l-2 border-camp-flame/70 bg-camp-paper/60 px-4 py-3 text-sm text-camp-ink/80">
              <span className="font-script text-base text-camp-flame">a small ask —</span>{" "}
              please use the lowest-numbered option that works for you. Every dollar that doesn&apos;t go to
              processing fees stays at camp.
            </div>
          </div>
          <div className="col-span-12 grid gap-5 md:col-span-8 md:grid-cols-2">
            <div className="relative flex flex-col gap-3 border-2 border-camp-flame/60 bg-camp-paper p-6 shadow-[0_2px_0_0_rgba(0,0,0,0.04)]">
              <div className="absolute -right-2 -top-3 rotate-3 bg-camp-flame px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-camp-paper">
                preferred
              </div>
              <div className="flex items-center justify-between">
                <span className="font-script text-3xl leading-none text-camp-bark/60">01</span>
                <div className="text-camp-flame"><Envelope size={32} weight="duotone" /></div>
              </div>
              <div className="font-camp text-2xl text-camp-bark">Email money transfer</div>
              <p className="text-camp-ink/80">
                Send to{" "}
                <a className="text-camp-flame underline" href={`mailto:${camp.paymentEmail}`}>
                  {camp.paymentEmail}
                </a>
                . Camper&apos;s name in the memo.
              </p>
              <div className="font-script mt-auto text-camp-bark/65">no fees</div>
            </div>

            <div className="flex flex-col gap-3 border-2 border-camp-bark/30 bg-camp-paper p-6">
              <div className="flex items-center justify-between">
                <span className="font-script text-3xl leading-none text-camp-bark/60">02</span>
                <div className="text-camp-flame"><HandCoins size={32} weight="duotone" /></div>
              </div>
              <div className="font-camp text-2xl text-camp-bark">Cash in person</div>
              <p className="text-camp-ink/80">
                Drop it off at a halaqah or arrange a hand-off with an organizer. We&apos;ll send a receipt
                back.
              </p>
              <div className="font-script mt-auto text-camp-bark/65">no fees</div>
            </div>

            <div className="flex flex-col gap-3 border-2 border-camp-bark/30 bg-camp-paper p-6">
              <div className="flex items-center justify-between">
                <span className="font-script text-3xl leading-none text-camp-bark/60">03</span>
                <div className="text-camp-flame"><NotePencil size={32} weight="duotone" /></div>
              </div>
              <div className="font-camp text-2xl text-camp-bark">Cheque</div>
              <p className="text-camp-ink/80">
                Made payable to{" "}
                <span className="font-medium text-camp-bark">Muslim Youth of Ottawa</span>. Camper&apos;s
                name in the memo line.
              </p>
              <div className="font-script mt-auto text-camp-bark/65">no fees</div>
            </div>

            <div className="flex flex-col gap-3 border-2 border-camp-bark/30 bg-camp-paper p-6">
              <div className="flex items-center justify-between">
                <span className="font-script text-3xl leading-none text-camp-bark/60">04</span>
                <div className="text-camp-flame"><Wallet size={32} weight="duotone" /></div>
              </div>
              <div className="font-camp text-2xl text-camp-bark">PayPal</div>
              <p className="text-camp-ink/80">
                Last resort — PayPal takes a per-camper fee out of camp funds. We&apos;ll send the link in
                your confirmation email.
              </p>
              <div className="font-script mt-auto text-camp-bark/65">~3% fee</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-camp-paper">
        <SectionScatter variant="forest" />
        <div className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 md:py-16">
          <div className="font-script text-center text-2xl text-camp-flame">the form</div>
          <h2 className="font-camp mt-1 text-center text-4xl text-camp-bark md:text-5xl">
            Fill this out per camper.
          </h2>
          <div className="mt-8 overflow-hidden border-2 border-camp-bark/30 bg-camp-paper-soft">
            <iframe
              title="MYO Camp registration form"
              src={`${camp.formUrl}?parentURL=${encodeURIComponent("https://myo.camp/camp/register")}&jsForm=true`}
              loading="lazy"
              className="block h-[1200px] w-full"
            />
          </div>
          <p className="mt-4 text-center text-sm text-camp-ink/65">
            Trouble loading the form?{" "}
            <a href={camp.formUrl} target="_blank" rel="noopener" className="text-camp-flame underline">
              Open in a new tab
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
