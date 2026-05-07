import type { Metadata } from "next";
import { Envelope, Wallet } from "@phosphor-icons/react/dist/ssr";
import { getCampSettings } from "@/lib/content/camp";
import { formatRange } from "@/lib/date";
import { PaintedDivider } from "@/components/camp/Illustrations";

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
      <section className="topo-bg bg-camp-paper">
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
                ["Camp dates", formatRange(camp.campStart, camp.campEnd)],
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

      <section className="bg-camp-paper-soft">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-6 px-6 py-16 md:gap-10 md:px-10 md:py-20">
          <div className="col-span-12 md:col-span-4">
            <div className="font-script text-2xl text-camp-flame">how to pay</div>
            <h2 className="font-camp mt-2 text-4xl text-camp-bark md:text-5xl">Two options.</h2>
            <p className="mt-4 text-camp-ink/80">
              Wait for confirmation before sending payment. We confirm spots first, then collect.
            </p>
          </div>
          <div className="col-span-12 grid gap-5 md:col-span-8 md:grid-cols-2">
            <div className="flex flex-col gap-3 border-2 border-camp-bark/30 bg-camp-paper p-6">
              <div className="text-camp-flame"><Envelope size={32} weight="duotone" /></div>
              <div className="font-camp text-2xl text-camp-bark">Email money transfer</div>
              <p className="text-camp-ink/80">
                Send to <a className="text-camp-flame underline" href={`mailto:${camp.paymentEmail}`}>{camp.paymentEmail}</a>. Camper&apos;s name in the memo.
              </p>
              <div className="font-script mt-auto text-camp-bark/65">no fees</div>
            </div>
            <div className="flex flex-col gap-3 border-2 border-camp-bark/30 bg-camp-paper p-6">
              <div className="text-camp-flame"><Wallet size={32} weight="duotone" /></div>
              <div className="font-camp text-2xl text-camp-bark">PayPal</div>
              <p className="text-camp-ink/80">
                If EMT isn&apos;t an option. PayPal adds a small per-camper fee — we&apos;ll send the link in
                your confirmation email.
              </p>
              <div className="font-script mt-auto text-camp-bark/65">~3% fee</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-camp-paper">
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
