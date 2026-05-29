import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampRegisterView } from "@/components/camp/CampRegisterView";
import { fetchPublicCampBySlug, fetchRegisterablePublicCamps } from "@/lib/content/camps-public";
import { buildPageMetadata, SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const camp = await fetchPublicCampBySlug(slug);
  if (!camp) return { title: "Camp · Register" };
  return buildPageMetadata({
    title: `Register · ${camp.title}`,
    description: `Register for ${camp.title} at MYO Camp — myo.camp.`,
    path: `/camp/${camp.slug}/register`,
    image: camp.heroImage
  });
}

export default async function CampSlugRegisterPage({ params }: PageProps) {
  const { slug } = await params;
  const camp = await fetchPublicCampBySlug(slug);
  if (!camp) notFound();

  const allOpen = await fetchRegisterablePublicCamps();

  return (
    <CampRegisterView camp={camp} siteOrigin={SITE_URL} otherOpenCamps={allOpen} currentSlug={slug} />
  );
}
