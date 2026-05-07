import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap"
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "MYO Camp",
  description:
    "A volunteer-run Muslim youth summer camp in Ontario with cabins, canoeing, campfires, faith, leadership, and friendship.",
  icons: {
    icon: "/Pictures/Logo.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${display.variable}`}>{children}</body>
    </html>
  );
}
