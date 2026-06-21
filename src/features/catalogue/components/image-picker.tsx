import { ImagePlus, X } from "lucide-react";
import { useRef } from "react";

import { validateImageFileType } from "#/features/catalogue/utils/validate-image-file-type";
import { cn } from "#/lib/utils";

type Props = {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
};

export function ImagePicker({ value, onChange, maxFiles = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const remaining = maxFiles - value.length;
    const filesToAdd = Array.from(newFiles).slice(0, remaining);

    const hasInvalidTypes = filesToAdd.some((file) => !validateImageFileType(file));

    if (hasInvalidTypes) {
      alert("Some files have unsupported formats. Please select JPEG, PNG, AVIF, or WEBP images.");
      return;
    }

    onChange([...value, ...filesToAdd]);
  };

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const primary = value[0];
  const secondary = value.slice(1, 3);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:grid-rows-2">
        {/* Primary image — spans full width on mobile, 2 rows on desktop */}
        <div
          className={cn(
            "relative min-h-64 overflow-hidden rounded-2xl border sm:row-span-2",
            !primary && "flex items-center justify-center border-dashed",
          )}
        >
          {primary ? (
            <>
              <img
                src={URL.createObjectURL(primary)}
                alt={primary.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(0)}
                className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <ImagePlus className="size-8" />
              <span className="text-sm">Add primary photo</span>
            </button>
          )}
        </div>

        {/* Secondary images */}
        {secondary.map((file, i) => (
          <div
            key={`${file.name}-${i + 1}`}
            className="relative hidden overflow-hidden rounded-2xl border sm:block"
          >
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeFile(i + 1)}
              className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {/* Empty secondary slots */}
        {secondary.length < 2 &&
          Array.from({ length: 2 - secondary.length }).map((_, i) => (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={() => inputRef.current?.click()}
              className="hidden flex-col items-center justify-center gap-1 rounded-2xl border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground sm:flex"
            >
              <ImagePlus className="size-5" />
              <span className="text-xs">Add</span>
            </button>
          ))}
      </div>

      {/* Mobile: show all remaining as horizontal strip */}
      {value.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:hidden">
          {value.slice(1).map((file, i) => (
            <div
              key={`${file.name}-m-${i}`}
              className="relative size-20 shrink-0 overflow-hidden rounded-xl border"
            >
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i + 1)}
                className="absolute top-0.5 right-0.5 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        aria-label="Add images"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
