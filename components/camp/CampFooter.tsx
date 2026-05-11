import Link from "next/link";
import { getCampSettings } from "@/lib/content/camp";
import { getSiteSettings } from "@/lib/content/org";
import { SocialLinks } from "@/components/main/SocialLinks";
import { TopoDivider } from "./Illustrations";

export async function CampFooter() {
  const [camp, settings] = await Promise.all([getCampSettings(), getSiteSettings()]);

  return (
    <footer className="mt-24 bg-camp-paper-soft">
      <TopoDivider className="text-camp-bark/30" />
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-16 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <div className="font-camp text-5xl leading-none text-camp-bark">MYO Camp</div>
          <p className="font-script mt-3 text-2xl leading-none text-camp-flame">
            two focused sessions · August
          </p>
          <p className="mt-6 max-w-[44ch] text-sm leading-relaxed text-camp-ink/80">
            A volunteer-run summer camp for Muslim youth at Camp Smitty in Eganville, Ontario. Cabins,
            canoes, fire-circles, prayer, leadership, friendship.
          </p>
          <SocialLinks links={settings.socials} className="mt-6" />
        </div>

        <div className="md:col-span-3">
          <div className="text-xs uppercase tracking-[0.18em] text-camp-bark/60">Get there</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/camp/story" className="text-camp-bark hover:text-camp-flame">Story</Link></li>
            <li><Link href="/camp/location" className="text-camp-bark hover:text-camp-flame">Location</Link></li>
            <li><Link href="/camp/register" className="text-camp-bark hover:text-camp-flame">Register</Link></li>
            <li><Link href="/camp/rules" className="text-camp-bark hover:text-camp-flame">Rules & packing</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <div className="text-xs uppercase tracking-[0.18em] text-camp-bark/60">Reach the camp office</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${camp.paymentEmail}`} className="text-camp-bark hover:text-camp-flame">
                {camp.paymentEmail}
              </a>
            </li>
            <li className="text-camp-ink/70">Camp Smitty · 98 Mink Lake Road · Eganville</li>
            <li>
              <a
                href={settings.newsletterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-camp-bark hover:text-camp-flame"
              >
                Adventure List newsletter
              </a>
            </li>
            <li>
              <Link href="/" className="text-camp-bark hover:text-camp-flame">← Back to MYO</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
