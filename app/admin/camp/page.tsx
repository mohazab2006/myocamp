import { redirect } from "next/navigation";

export default function LegacyAdminCampRedirect() {
  redirect("/admin/camps");
}
