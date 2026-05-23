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
      </div>
    </section>
  );
}
