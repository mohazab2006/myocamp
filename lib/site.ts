import type { Metadata } from "next";

export const SITE_DOMAIN = "myo.camp";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? `https://${SITE_DOMAIN}`;

export const SITE_NAME = "Muslim Youth of Ottawa";
export const SITE_NAME_SHORT = "MYO";

export const SITE_TAGLINE =
  "Hikes, halaqas, leadership, and the annual MYO Summer Camp at Camp Smitty.";

export const DEFAULT_DESCRIPTION =
  "Muslim Youth of Ottawa runs hikes, halaqas, service days, and the MYO Summer Camp — cabins, canoeing, campfires, faith, and friendship for youth in Ottawa.";

export const DEFAULT_OG_IMAGE_PATH = "/Pictures/og-image.png";

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function defaultOpenGraph(): NonNullable<Metadata["openGraph"]> {
  return {
    title: SITE_NAME,
    description: SITE_TAGLINE,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — programs, events, and summer camp at Camp Smitty.`
      }
    ]
  };
}

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
}): Metadata {
  const url = absoluteUrl(opts.path);
  const imagePath = opts.image ?? DEFAULT_OG_IMAGE_PATH;
  const imageUrl = imagePath.startsWith("http") ? imagePath : absoluteUrl(imagePath);

  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_CA",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: opts.title }]
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [imageUrl]
    }
  };
}

export const rootMetadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME_SHORT}`
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: defaultOpenGraph(),
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_TAGLINE,
    images: [DEFAULT_OG_IMAGE_PATH]
  },
  icons: {
    icon: "/Pictures/LogoMAIN.png",
    apple: "/Pictures/LogoMAIN.png"
  }
};
