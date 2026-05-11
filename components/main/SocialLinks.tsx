import type { SocialLink } from "@/lib/types";
import {
  Envelope,
  FacebookLogo,
  Images,
  InstagramLogo,
  Tent,
  Video
} from "@phosphor-icons/react/dist/ssr";

const iconFor = (platform: SocialLink["platform"]) => {
  switch (platform) {
    case "facebook":
      return FacebookLogo;
    case "instagram":
      return InstagramLogo;
    case "email":
      return Envelope;
    case "photos":
      return Images;
    case "vimeo":
      return Video;
    case "camp":
      return Tent;
  }
};

type SocialLinksProps = {
  links: SocialLink[];
  tone?: "light" | "dark";
  className?: string;
};

export function SocialLinks({ links, tone = "dark", className }: SocialLinksProps) {
  const shell =
    tone === "light"
      ? "border-paper/20 bg-paper/10 text-paper hover:border-paper/40 hover:bg-paper/15"
      : "border-line bg-paper text-ink-soft hover:border-ink/20 hover:bg-paper-deep hover:text-ink";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className ?? ""}`}>
      {links.map((link) => {
        const Icon = iconFor(link.platform);
        const external = link.url.startsWith("http");

        return (
          <a
            key={`${link.platform}-${link.url}`}
            href={link.url}
            aria-label={link.label}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${shell}`}
          >
            <Icon size={18} weight="fill" />
          </a>
        );
      })}
    </div>
  );
}
