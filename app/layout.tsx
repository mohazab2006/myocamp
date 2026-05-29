import "./globals.css";

import type { ReactNode } from "react";

import { rootMetadata } from "@/lib/site";
import { Caprasimo, Caveat, Fraunces, Geist } from "next/font/google";

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

export const metadata = rootMetadata;

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
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
