import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  bordered?: boolean;
  background?: "paper" | "paper-deep";
};

export function PageHero({
  eyebrow,
  title,
  description,
  action,
  className,
  bordered = true,
  background = "paper"
}: PageHeroProps) {
  const bg = background === "paper-deep" ? "bg-paper-deep/50" : "bg-paper";
  const border = bordered ? "border-b border-line" : "";

  return (
    <section className={`${border} ${bg} ${className ?? ""}`}>
      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 md:py-32">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          action={action}
          size="lg"
        />
      </div>
    </section>
  );
}
