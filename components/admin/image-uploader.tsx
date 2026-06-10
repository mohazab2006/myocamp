"use client";

import { useCallback, useId, useRef, useState, useTransition } from "react";
import { CircleNotch, Image as ImageIcon, Trash, UploadSimple } from "@phosphor-icons/react";

import { uploadImageAction } from "@/app/admin/actions";

type ImageUploaderProps = {
  /** Form field name that the parent <form> will read on submit. */
  name: string;
  /** Initial image URL (e.g. existing event hero). */
  defaultValue?: string;
  /** Storage sub-folder ("events", "blog", "covers"). */
  folder: string;
  /** Optional aspect-ratio hint for the preview (e.g. "16/9", "1/1"). */
  aspect?: string;
};

const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";

export function ImageUploader({ name, defaultValue, folder, aspect = "16/9" }: ImageUploaderProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [url, setUrl] = useState<string>(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPending, startTransition] = useTransition();

  const upload = useCallback(
    (file: File) => {
      setError(null);

      if (!file.type.startsWith("image/")) {
        setError("That isn't an image file.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(`Image is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 8 MB.`);
        return;
      }

      startTransition(async () => {
        try {
          const data = new FormData();
          data.set("file", file);
          data.set("folder", folder);

          const result = await uploadImageAction(data);
          if (result.error) {
            setError(result.error);
            return;
          }
          if (result.url) {
            setUrl(result.url);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed.");
        }
      });
    },
    [folder]
  );

  const onFile = (file: File | null | undefined) => {
    if (!file) return;
    upload(file);
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    onFile(event.dataTransfer.files?.[0]);
  };

  const openFilePicker = (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (isPending) return;
    fileInputRef.current?.click();
  };

  const clear = () => {
    setUrl("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={url} />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`group relative border-2 border-dashed transition ${
          isDragging
            ? "border-pine bg-sky/40"
            : "border-line bg-paper-deep/30 hover:border-pine/60 hover:bg-paper-deep/50"
        }`}
        style={{ aspectRatio: aspect }}
      >
        {!isPending ? (
          <label
            htmlFor={inputId}
            className="absolute inset-0 z-[1] cursor-pointer"
            aria-label={url ? "Replace image" : "Upload image"}
          />
        ) : null}

        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Uploaded preview"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center pointer-events-none">
            <div className="flex h-12 w-12 items-center justify-center border border-line bg-paper text-pine">
              {isPending ? (
                <CircleNotch size={22} weight="bold" className="animate-spin" />
              ) : (
                <UploadSimple size={22} weight="duotone" />
              )}
            </div>
            <p className="text-sm font-semibold text-ink">
              {isPending ? "Uploading…" : "Drag an image here or click to browse"}
            </p>
            <p className="text-xs text-ink-soft">PNG, JPG, WEBP, GIF, or AVIF · up to 8 MB</p>
          </div>
        )}

        {url && isPending ? (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/40 text-paper">
            <CircleNotch size={28} weight="bold" className="animate-spin" />
          </div>
        ) : null}

        {url ? (
          <div className="absolute inset-x-0 bottom-0 z-[2] flex items-center justify-between gap-2 bg-ink/70 px-3 py-2 text-paper backdrop-blur-sm">
            <span className="inline-flex items-center gap-2 text-xs pointer-events-none">
              <ImageIcon size={14} weight="duotone" />
              <span className="max-w-[220px] truncate" title={url}>
                {url.split("/").pop()}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openFilePicker}
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-paper/90 hover:text-paper"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  clear();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ember hover:text-paper"
              >
                <Trash size={12} weight="bold" />
                Remove
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          // Reset so picking the same file again still fires change.
          event.target.value = "";
          onFile(file);
        }}
      />

      {error ? (
        <p className="text-xs leading-relaxed text-ember" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
