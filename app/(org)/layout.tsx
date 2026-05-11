import { OrgNav } from "@/components/main/OrgNav";
import { OrgFooter } from "@/components/main/OrgFooter";
import { NewsletterCallout } from "@/components/main/NewsletterCallout";
import { BodyTheme } from "@/components/shared/BodyTheme";

export default function OrgLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BodyTheme theme="org" />
      <a className="skip-link" href="#main">Skip to main content</a>
      <OrgNav />
      <main id="main" className="min-h-[100dvh]">
        {children}
      </main>
      <NewsletterCallout />
      <OrgFooter />
    </>
  );
}
