"use client";

import type { ReactNode } from "react";

import { AdminSubmitButton } from "@/components/admin/submit-button";

type AdminDeleteFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  slug: string;
  label: string;
  pendingLabel?: string;
  confirmMessage: string;
  icon?: ReactNode;
  className?: string;
};

export function AdminDeleteForm({
  action,
  slug,
  label,
  pendingLabel = "Deleting…",
  confirmMessage,
  icon,
  className
}: AdminDeleteFormProps) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <AdminSubmitButton
        idleLabel={label}
        pendingLabel={pendingLabel}
        variant="danger"
        icon={icon}
      />
    </form>
  );
}
