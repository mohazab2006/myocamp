import { CampNav } from "@/components/camp/CampNav";
import { CampFooter } from "@/components/camp/CampFooter";
import { NewsletterCallout } from "@/components/main/NewsletterCallout";
import { BodyTheme } from "@/components/shared/BodyTheme";
import { buildPageMetadata, SITE_NAME_SHORT } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = buildPageMetadata({
  title: `${SITE_NAME_SHORT} Camp`,
  description:
    "MYO Summer Camp at Camp Smitty in Eganville, Ontario. Register for LIT or main camp online at myo.camp.",
  path: "/camp"
});

export default function CampLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BodyTheme theme="camp" />
      <a className="skip-link" href="#camp-main">Skip to main content</a>
      <CampNav />
      <main id="camp-main" className="min-h-[100dvh]">
        {children}
      </main>
      <NewsletterCallout />
      <CampFooter />
    </>
  );
}
