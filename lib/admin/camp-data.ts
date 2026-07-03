import "server-only";

export type CampDataFields = {
  paymentEmail: string | null;
  heroImage: string | null;
  featuredOnEvents: boolean;
  ageMin: number | null;
  ageMax: number | null;
};

export function parseCampData(data: Record<string, unknown> | null): CampDataFields {
  const paymentEmail =
    data && typeof data.paymentEmail === "string" && data.paymentEmail.trim()
      ? data.paymentEmail.trim()
      : null;
  const heroImage =
    data && typeof data.heroImage === "string" && data.heroImage.trim()
      ? data.heroImage.trim()
      : null;
  const ageMin =
    data && typeof data.ageMin === "number" && Number.isFinite(data.ageMin) ? data.ageMin : null;
  const ageMax =
    data && typeof data.ageMax === "number" && Number.isFinite(data.ageMax) ? data.ageMax : null;
  return {
    paymentEmail,
    heroImage,
    featuredOnEvents: data?.featuredOnEvents === true,
    ageMin,
    ageMax
  };
}

export function mergeCampData(
  existing: Record<string, unknown> | null,
  fields: CampDataFields
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...(existing ?? {}) };

  if (fields.paymentEmail) merged.paymentEmail = fields.paymentEmail;
  else delete merged.paymentEmail;

  if (fields.heroImage) merged.heroImage = fields.heroImage;
  else delete merged.heroImage;

  if (fields.featuredOnEvents) merged.featuredOnEvents = true;
  else delete merged.featuredOnEvents;

  if (fields.ageMin != null) merged.ageMin = fields.ageMin;
  else delete merged.ageMin;

  if (fields.ageMax != null) merged.ageMax = fields.ageMax;
  else delete merged.ageMax;

  return merged;
}
