import Link from "next/link";
import { getSiteSettings } from "@/lib/content/org";
import { SocialLinks } from "@/components/main/SocialLinks";

export async function OrgFooter() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-24 bg-forest text-paper">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-6 py-16 md:grid-cols-12 md:px-10">
        <div className="md:col-span-5">
          <div className="font-display text-3xl leading-none tracking-tight">Muslim Youth of Ottawa</div>
          <p className="mt-4 max-w-[42ch] text-sm text-paper/75">
            A volunteer-led community for Muslim youth in Ottawa — hikes, halaqas, service days, and the camp at
            Camp Smitty every August.
          </p>
          <SocialLinks links={settings.socials} tone="light" className="mt-6" />
        </div>

        <div className="md:col-span-3">
          <div className="text-xs uppercase tracking-[0.18em] text-paper/55">Explore</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/events" className="hover:text-paper">Events</Link></li>
            <li><Link href="/blog" className="hover:text-paper">Blog</Link></li>
            <li><Link href="/camp" className="hover:text-paper">MYO Camp</Link></li>
            <li><Link href="/about" className="hover:text-paper">About</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-[0.18em] text-paper/55">Help</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/support" className="hover:text-paper">Donate</Link></li>
            <li><a href={settings.volunteerUrl} className="hover:text-paper">Volunteer</a></li>
            <li><Link href="/contact" className="hover:text-paper">Contact</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="text-xs uppercase tracking-[0.18em] text-paper/55">Reach</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href={`mailto:${settings.email}`} className="hover:text-paper">
                {settings.email}
              </a>
            </li>
            <li>
              <a
                href={settings.newsletterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-paper"
              >
                Adventure List newsletter
              </a>
            </li>
            <li className="text-paper/65">Ottawa, Ontario</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-paper/12">
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-paper/60 md:px-10">
          <span>© {new Date().getFullYear()} Muslim Youth of Ottawa. Volunteer-run, community-funded.</span>
          <span>Built with the woods in mind.</span>
        </div>
      </div>
    </footer>
  );
}
