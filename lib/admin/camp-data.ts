import "server-only";

export type CampDataFields = {
  paymentEmail: string | null;
  heroImage: string | null;
  featuredOnEvents: boolean;
  ageMin: number | null;
  ageMax: number | null;
  dropOffDetails: string | null;
  pickupDetails: string | null;
  rulesUrl: string | null;
};

export function parseCampData(data: Record<string, unknown> | null): CampDataFields {
  const str = (key: string) =>
    data && typeof data[key] === "string" && (data[key] as string).trim()
      ? (data[key] as string).trim()
      : null;
  const num = (key: string) =>
    data && typeof data[key] === "number" && Number.isFinite(data[key]) ? (data[key] as number) : null;
  return {
    paymentEmail: str("paymentEmail"),
    heroImage: str("heroImage"),
    featuredOnEvents: data?.featuredOnEvents === true,
    ageMin: num("ageMin"),
    ageMax: num("ageMax"),
    dropOffDetails: str("dropOffDetails"),
    pickupDetails: str("pickupDetails"),
    rulesUrl: str("rulesUrl")
  };
}

export function mergeCampData(
  existing: Record<string, unknown> | null,
  fields: CampDataFields
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...(existing ?? {}) };

  const setOrDel = (key: string, val: string | number | boolean | null | undefined) => {
    if (val != null && val !== "" && val !== false) merged[key] = val;
    else delete merged[key];
  };

  setOrDel("paymentEmail", fields.paymentEmail);
  setOrDel("heroImage", fields.heroImage);
  setOrDel("featuredOnEvents", fields.featuredOnEvents || undefined);
  setOrDel("ageMin", fields.ageMin);
  setOrDel("ageMax", fields.ageMax);
  setOrDel("dropOffDetails", fields.dropOffDetails);
  setOrDel("pickupDetails", fields.pickupDetails);
  setOrDel("rulesUrl", fields.rulesUrl);

  return merged;
}
