import { CheckCircle, Info, WarningCircle } from "@phosphor-icons/react/ssr";

type FlashBannerProps = {
  message: string | null;
  type: "success" | "error" | "info" | null;
  className?: string;
};

export function AdminFlashBanner({ message, type, className }: FlashBannerProps) {
  if (!message) return null;

  const Icon = type === "success" ? CheckCircle : type === "error" ? WarningCircle : Info;
  const tone =
    type === "success"
      ? "border-pine/30 bg-sky/55 text-forest"
      : type === "error"
        ? "border-ember/40 bg-ember/10 text-ink"
        : "border-line bg-paper-deep/60 text-ink";

  return (
    <div className={`flex items-start gap-3 border p-4 text-sm ${tone} ${className ?? ""}`.trim()}>
      <Icon size={18} weight="duotone" className="mt-0.5 shrink-0" />
      <span className="leading-relaxed">{message}</span>
    </div>
  );
}
