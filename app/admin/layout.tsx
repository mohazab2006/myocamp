import { BodyTheme } from "@/components/shared/BodyTheme";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | MYO",
  robots: { index: false, follow: false }
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BodyTheme theme="org" />
      <main className="min-h-[100dvh]">{children}</main>
    </>
  );
}
