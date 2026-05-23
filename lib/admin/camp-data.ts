import "server-only";

export type CampDataFields = {
  paymentEmail: string | null;
  heroImage: string | null;
  featuredOnEvents: boolean;
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
  return {
    paymentEmail,
    heroImage,
    featuredOnEvents: data?.featuredOnEvents === true
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

  return merged;
}
