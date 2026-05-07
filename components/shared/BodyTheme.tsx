"use client";

import { useEffect } from "react";

export function BodyTheme({ theme }: { theme: "org" | "camp" }) {
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);
  return null;
}
