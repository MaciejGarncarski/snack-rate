import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { Image } from "#/components/image/image";
import { Button } from "#/components/ui/button";
import { Popover, PopoverTrigger } from "#/components/ui/popover";
import {
  REACTION_ICONS,
  REACTION_TYPE_LABELS,
  REACTION_TYPES,
  type ReactionType,
} from "#/features/comments/consts/reaction-type.const";
import type { SnackComment } from "#/features/comments/contracts/comments";
import { cn } from "#/lib/utils";
import { orpc } from "#/orpc/client";

const REACTION_ACTIVE_BG: Record<ReactionType, string> = {
  like: "bg-blue-500/15 ring-blue-500/20",
  dislike: "bg-stone-500/15 ring-stone-500/20",
  heart: "bg-rose-500/15 ring-rose-500/20",
  laugh: "bg-amber-500/15 ring-amber-500/20",
  angry: "bg-red-500/15 ring-red-500/20",
  sad: "bg-sky-500/15 ring-sky-500/20",
};

type Props = {
  comment: SnackComment;
  snackItemId: string;
};

export function CommentReactions({ comment }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const react = useMutation(
    orpc.comments.react.mutationOptions({
      onSettled: () => setIsOpen(false),
    }),
  );

  const totalReactions = Object.values(comment.reactions ?? {}).reduce(
    (acc, count) => acc + (count ?? 0),
    0,
  );

  const activeIcon = comment.userReaction
    ? REACTION_ICONS[comment.userReaction]
    : REACTION_ICONS.like;

  const handleSelectReaction = (type: ReactionType) => {
    setIsOpen(false);
    react.mutate({ commentId: comment.id, type });
  };

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <PopoverTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <Button size="xs" variant="default" isDisabled={react.isPending} className="min-w-0 gap-1">
          <Image src={activeIcon} alt="" className="size-3.5" />
          {totalReactions > 0 ? (
            <span className="text-xs tabular-nums opacity-80">{totalReactions}</span>
          ) : (
            "Zareaguj"
          )}
        </Button>
        <Popover
          placement="top"
          offset={8}
          className={cn("w-auto p-1.5 rounded-2xl flex-row gap-1")}
        >
          <div
            role="menu"
            aria-label="Wybierz reakcję"
            tabIndex={-1}
            className={cn("flex items-center gap-1")}
          >
            {REACTION_TYPES.map((type) => {
              const iconImg = REACTION_ICONS[type];
              const count = comment.reactions?.[type] ?? 0;
              const isSelected = comment.userReaction === type;
              const label = REACTION_TYPE_LABELS[type];

              return (
                <button
                  key={type}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  aria-label={`${label}${count ? ` (${count})` : ""}`}
                  title={label}
                  disabled={react.isPending}
                  onClick={() => handleSelectReaction(type)}
                  className={cn(
                    "relative flex size-10 items-center justify-center rounded-xl border border-transparent bg-muted/50 transition-all hover:scale-110 active:scale-95 disabled:opacity-50",
                    isSelected
                      ? cn(REACTION_ACTIVE_BG[type], "ring-1 scale-105")
                      : "hover:bg-accent",
                  )}
                >
                  <Image blurBackground src={iconImg} alt={label} className="size-8" />
                  {count > 0 ? (
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-foreground px-1 py-0 text-[10px] leading-none font-semibold text-background tabular-nums">
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </Popover>
      </PopoverTrigger>

      {totalReactions > 0 ? (
        <div className="flex items-center gap-1 text-xs text-muted-foreground" aria-hidden>
          <span className="hidden sm:inline">
            {totalReactions} {totalReactions === 1 ? "reakcja" : "reakcji"} ·
          </span>
          <span className="flex items-center gap-1">
            {REACTION_TYPES.filter((t) => (comment.reactions?.[t] ?? 0) > 0)
              .slice(0, 4)
              .map((t) => {
                return (
                  <span key={t} className="inline-flex items-center gap-0.5">
                    {comment.reactions[t]}
                  </span>
                );
              })}
            {REACTION_TYPES.filter((t) => (comment.reactions?.[t] ?? 0) > 0).length > 4 ? (
              <span>…</span>
            ) : null}
          </span>
        </div>
      ) : null}
    </div>
  );
}
