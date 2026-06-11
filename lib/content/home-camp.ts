import "server-only";

import { getCampSettings } from "@/lib/content/camp";
import {
  fetchPublicCampsIndex,
  fetchRegisterablePublicCamps,
  type PublicCamp
} from "@/lib/content/camps-public";
import { getEvents } from "@/lib/content/events";
import { formatRange, formatRangeNoYear, isUpcoming } from "@/lib/date";
import type { CampSettings, OrgEvent } from "@/lib/types";

export type HomeCampDate = {
  title: string;
  dates: string;
  href: string;
  isOpen: boolean;
};

export type HomeBigNewsLink = {
  href: string;
  label: string;
  primary?: boolean;
};

export type HomeBigNews = {
  label?: string;
  message: string;
  highlight?: string;
  links: HomeBigNewsLink[];
};

function isRegisterable(camp: PublicCamp): boolean {
  return camp.status === "open" || camp.status === "full";
}

function eventHrefForCamp(campSlug: string, events: OrgEvent[]): string {
  const event = events.find((e) => e.campSlug === campSlug);
  return event ? `/events/${event.slug}` : "/camp";
}

function legacyCampDates(legacy: CampSettings, events: OrgEvent[]): HomeCampDate[] {
  const rows: HomeCampDate[] = [];
  if (legacy.litStart && legacy.litEnd) {
    rows.push({
      title: "LIT session",
      dates: formatRangeNoYear(legacy.litStart, legacy.litEnd),
      href: eventHrefForCamp("lit-camp-2026", events),
      isOpen: false
    });
  }
  rows.push({
    title: "Youth camp",
    dates: formatRangeNoYear(legacy.campStart, legacy.campEnd),
    href: eventHrefForCamp("main-camp-2026", events),
    isOpen: false
  });
  return rows;
}

function buildCampDates(
  camps: PublicCamp[],
  legacy: CampSettings,
  events: OrgEvent[]
): HomeCampDate[] {
  const visible = camps.filter((c) => c.status !== "draft" && c.status !== "archived");
  if (visible.length === 0) return legacyCampDates(legacy, events);

  return visible.map((camp) => ({
    title: camp.title,
    dates: formatRangeNoYear(camp.startDate, camp.endDate),
    href: eventHrefForCamp(camp.slug, events),
    isOpen: isRegisterable(camp)
  }));
}

function buildBigNews(
  openCamps: PublicCamp[],
  legacy: CampSettings,
  events: OrgEvent[]
): HomeBigNews {
  const override = legacy.announcementOverride;
  if (override?.enabled) {
    return {
      label: override.label,
      message: override.message,
      highlight: override.highlight,
      links: override.links ?? []
    };
  }

  if (openCamps.length > 0) {
    return {
      message: "Camp registration is now open",
      links: [
        { href: "/camp", label: "Visit camp site", primary: true },
        ...openCamps.map((camp) => ({
          href: eventHrefForCamp(camp.slug, events),
          label: camp.title
        }))
      ]
    };
  }

  return {
    message: "MYO Summer Camp 2026 registration opens",
    highlight: legacy.registrationOpens ? formatRange(legacy.registrationOpens) : undefined,
    links: [{ href: "/camp", label: "Camp preview", primary: true }]
  };
}

export function sortHomeUpcomingEvents(events: OrgEvent[], campSlugs: Set<string>): OrgEvent[] {
  return events
    .filter((e) => isUpcoming(e))
    .sort((a, b) => {
      const score = (e: OrgEvent) => (e.campSlug && campSlugs.has(e.campSlug) ? 0 : 1);
      const diff = score(a) - score(b);
      if (diff !== 0) return diff;
      return +new Date(a.startDate) - +new Date(b.startDate);
    });
}

export async function getHomeCampSnapshot() {
  const [legacy, registerable, allCamps, events] = await Promise.all([
    getCampSettings(),
    fetchRegisterablePublicCamps(),
    fetchPublicCampsIndex(),
    getEvents()
  ]);

  const openCamps = registerable.filter(isRegisterable);
  const publishedCampSlugs = new Set(
    allCamps.filter((c) => c.status !== "draft" && c.status !== "archived").map((c) => c.slug)
  );
  const campDates = buildCampDates(allCamps, legacy, events);
  const bigNews = buildBigNews(openCamps, legacy, events);
  const linkedCampsBySlug = Object.fromEntries(
    allCamps.map((camp) => [
      camp.slug,
      {
        slug: camp.slug,
        title: camp.title,
        heroImage: camp.heroImage,
        registerPath: camp.registerPath
      }
    ])
  );

  return {
    openCamps,
    campDates,
    bigNews,
    events,
    publishedCampSlugs,
    linkedCampsBySlug,
    registrationIsOpen: openCamps.length > 0
  };
}
