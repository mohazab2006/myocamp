export type AdminSearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | undefined;

export type AdminFlashState = {
  message: string | null;
  type: "success" | "error" | "info" | null;
};

export async function resolveAdminFlashState(
  searchParams: AdminSearchParams
): Promise<AdminFlashState> {
  const params = searchParams ? await searchParams : {};
  const message = typeof params.message === "string" ? params.message : null;
  const rawType = typeof params.type === "string" ? params.type : null;
  const type =
    rawType === "success" || rawType === "error" || rawType === "info"
      ? rawType
      : null;

  return { message, type };
}

export function buildAdminRedirect(
  base: string,
  type: "success" | "error" | "info",
  message: string
) {
  const params = new URLSearchParams({ type, message });
  return `${base}?${params.toString()}`;
}
