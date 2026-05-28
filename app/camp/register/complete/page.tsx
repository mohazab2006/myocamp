import type { Metadata } from "next";

import { RegistrationCompletePoller } from "@/components/camp/RegistrationCompletePoller";
import { SectionScatter } from "@/components/camp/Illustrations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Registration complete · MYO Camp",
  description: "Complete your MYO Camp registration and pay online."
};

type PageProps = {
  searchParams: Promise<{ sid?: string }>;
};

/** JotForm thank-you landing (no camp slug required — sid resolves the registration). */
export default async function RegisterCompletePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const sid = sp.sid?.trim();

  if (!sid) {
    return (
      <main className="min-h-dvh bg-camp-paper">
        <section className="relative isolate overflow-hidden px-6 py-20 md:py-28">
          <SectionScatter variant="route" />
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-camp text-4xl text-camp-bark">Missing submission</h1>
            <p className="mt-4 text-camp-ink/80">
              This page opens right after you submit the registration form. If you just registered,
              go back to the form and submit again, or contact us for help.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-camp-paper">
      <section className="relative isolate overflow-hidden px-6 py-20 md:py-28">
        <SectionScatter variant="route" />
        <RegistrationCompletePoller submissionId={sid} campTitle="MYO Camp" />
      </section>
    </main>
  );
}
