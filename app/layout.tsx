import type { Metadata } from "next";
import { Caprasimo, Caveat, Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

const caprasimo = Caprasimo({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-camp",
  display: "swap"
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Muslim Youth of Ottawa",
    template: "%s · MYO"
  },
  description:
    "Muslim Youth of Ottawa runs hikes, halaqas, service days, and the MYO Summer Camp — a week of cabins, canoeing, campfires, faith, and friendship.",
  metadataBase: new URL("https://myo.camp"),
  openGraph: {
    title: "Muslim Youth of Ottawa",
    description:
      "Hikes, halaqas, leadership, and the annual MYO Summer Camp at Camp Smitty.",
    url: "https://myo.camp",
    siteName: "Muslim Youth of Ottawa",
    type: "website",
    locale: "en_CA",
    images: [
      {
        url: "/Pictures/og-image.png",
        width: 1200,
        height: 630,
        alt: "Muslim Youth of Ottawa — volunteer-led programs, events, and summer camp at Camp Smitty."
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Muslim Youth of Ottawa",
    description:
      "Hikes, halaqas, leadership, and the annual MYO Summer Camp at Camp Smitty.",
    images: ["/Pictures/og-image.png"]
  },
  icons: {
    icon: "/Pictures/LogoMAIN.png",
    apple: "/Pictures/LogoMAIN.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${fraunces.variable} ${caprasimo.variable} ${caveat.variable}`}
    >
      <body data-theme="org" className="min-h-dvh antialiased">
        {children}
      </body>
    </html>
  );
}
