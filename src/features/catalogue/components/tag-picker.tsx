import { cn } from "#/lib/utils";
import { X } from "lucide-react";

type Tag = {
  id: string;
  name: string;
};

type Props = {
  tags: Tag[];
  value: string[];
  onChange: (ids: string[]) => void;
  maxTags?: number;
};

export function TagPicker({ tags, value, onChange, maxTags = 3 }: Props) {
  const toggleTag = (tagId: string) => {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId));
    } else if (value.length < maxTags) {
      onChange([...value, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors",
              value.includes(tag.id)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-transparent bg-input/50 text-muted-foreground hover:bg-input",
            )}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tagId) => {
            const tag = tags.find((t) => t.id === tagId);
            if (!tag) return null;

            return (
              <span
                key={tagId}
                className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
              >
                {tag.name}
                <button
                  type="button"
                  onClick={() => removeTag(tagId)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-secondary-foreground/20"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{maxTags} tags selected
      </p>
    </div>
  );
}
