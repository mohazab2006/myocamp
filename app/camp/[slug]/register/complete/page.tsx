import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RegistrationCompletePoller } from "@/components/camp/RegistrationCompletePoller";
import { SectionScatter } from "@/components/camp/Illustrations";
import { fetchPublicCampBySlug } from "@/lib/content/camps-public";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sid?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const camp = await fetchPublicCampBySlug(slug);
  if (!camp) return { title: "Registration complete · MYO Camp" };
  return {
    title: `Registration complete · ${camp.title}`,
    description: `Complete registration for ${camp.title} at MYO Camp.`
  };
}

export default async function CampRegisterCompletePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const sid = sp.sid?.trim();

  const camp = await fetchPublicCampBySlug(slug);
  if (!camp) notFound();

  if (!sid) {
    return (
      <main className="min-h-dvh bg-camp-paper">
        <section className="relative isolate overflow-hidden px-6 py-20 md:py-28">
          <SectionScatter variant="route" />
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-camp text-4xl text-camp-bark">Missing submission</h1>
            <p className="mt-4 text-camp-ink/80">
              This page is shown after you submit the registration form. If you just registered,
              wait a moment and try again from your confirmation link.
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
        <RegistrationCompletePoller submissionId={sid} campTitle={camp.title} />
      </section>
    </main>
  );
}
