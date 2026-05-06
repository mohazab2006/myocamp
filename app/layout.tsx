import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
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
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
