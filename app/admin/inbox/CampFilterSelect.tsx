"use client";

import { useRouter } from "next/navigation";

export function CampFilterSelect({
  campNames,
  hasUnknown,
  currentFilter,
  tab
}: {
  campNames: string[];
  hasUnknown: boolean;
  currentFilter: string;
  tab: string;
}) {
  const router = useRouter();
  return (
    <select
      value={currentFilter}
      onChange={(e) => {
        router.push(`/admin/inbox?tab=${tab}&camp=${encodeURIComponent(e.target.value)}`);
      }}
      className="h-8 border border-line bg-paper px-2 text-xs text-ink"
    >
      <option value="all">All camps</option>
      {campNames.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
      {hasUnknown && <option value="unknown">Unknown (no ref code)</option>}
    </select>
  );
}
