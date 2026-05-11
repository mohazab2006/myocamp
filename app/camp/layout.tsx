import { CampNav } from "@/components/camp/CampNav";
import { CampFooter } from "@/components/camp/CampFooter";
import { NewsletterCallout } from "@/components/main/NewsletterCallout";
import { BodyTheme } from "@/components/shared/BodyTheme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MYO Camp",
  description:
    "MYO Summer Camp at Camp Smitty in Eganville, Ontario. Two focused four-day sessions — LIT leadership track and main camp — with cabins, canoes, fire-circles, prayer, and friendship for Muslim youth ages 9 to 19."
};

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
