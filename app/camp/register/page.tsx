import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CampRegisterSelector } from "@/components/camp/CampRegisterSelector";
import { fetchRegisterablePublicCamps } from "@/lib/content/camps-public";

export const metadata: Metadata = {
  title: "Camp · Register",
  description: "Register for the MYO Summer Camp at Camp Smitty."
};

export const dynamic = "force-dynamic";

export default async function CampRegisterPage() {
  const camps = await fetchRegisterablePublicCamps();

  if (camps.length === 1) {
    redirect(camps[0].registerPath);
  }

  if (camps.length > 1) {
    return <CampRegisterSelector camps={camps} />;
  }

  return (
    <section className="topo-bg relative isolate overflow-hidden bg-camp-paper">
      <div className="mx-auto max-w-[720px] px-6 py-24 text-center md:px-10">
        <div className="font-script text-2xl text-camp-flame">registration</div>
        <h1 className="font-camp mt-3 text-5xl text-camp-bark">Not open yet.</h1>
        <p className="mt-4 text-lg leading-relaxed text-camp-ink/85">
          Registration isn&apos;t open for the upcoming camp session yet. We&apos;ll post the
          registration form here as soon as it opens — check back soon, or contact us if you have
          questions.
        </p>
        <p className="mt-6 text-camp-ink/70">
          Questions?{" "}
          <a href="/contact" className="text-camp-flame underline">
            Contact us
          </a>
          .
        </p>

        {/* Divider */}
        <div className="my-10 flex items-center gap-4">
          <div className="h-px flex-1 bg-camp-bark/20" />
          <span className="font-script text-lg text-camp-flame">in the meantime</span>
          <div className="h-px flex-1 bg-camp-bark/20" />
        </div>

        {/* Pre-registration actions */}
        <p className="text-base leading-relaxed text-camp-ink/80">
          Want to be first in line when registration opens? Fill out our pre-registration survey
          so we can plan ahead — and sign up for the newsletter so you don&apos;t miss the
          announcement.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="https://www.jotform.com/form/261603186124047"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 bg-camp-flame px-7 py-3.5 font-camp text-base text-camp-paper shadow-sm transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
          >
            Fill out the survey
          </a>
          <a
            href="http://eepurl.com/iXwvHk"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 border border-camp-bark/30 bg-camp-paper px-7 py-3.5 font-camp text-base text-camp-bark shadow-sm transition hover:border-camp-flame hover:text-camp-flame active:scale-[0.98] sm:w-auto"
          >
            Join the newsletter
          </a>
        </div>
      </div>
    </section>
  );
}
