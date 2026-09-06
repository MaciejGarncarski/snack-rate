import { ArrowLeft, ArrowRight, CheckIcon, PlusIcon } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "#/components/ui/button";
import { Tooltip, TooltipTrigger } from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";

type SlotWithImage = {
  isSelected: boolean;
  onClick: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  imageSrc?: string;
  index: number;
};

type EmptySlot = {
  isSelected?: never;
  onClick: () => void;
  onMoveLeft?: never;
  onMoveRight?: never;
  imageSrc?: never;
  index: number;
};

type Props = SlotWithImage | EmptySlot;

const rotations = ["rotate-[-1.2deg]", "rotate-[1deg]", "rotate-[-0.6deg]"];

export function ImageSlot({
  isSelected,
  onClick,
  onMoveLeft,
  onMoveRight,
  imageSrc,
  index,
}: Props) {
  const isEmpty = !imageSrc;
  const rotation = rotations[index % rotations.length];

  if (isEmpty) {
    return (
      <motion.div
        layout="position"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className={cn("shrink-0", rotation)}
      >
        <button
          type="button"
          onClick={onClick}
          aria-label="Dodaj zdjęcie"
          className="group flex h-26 w-21 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card transition-colors hover:border-primary/30 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:h-34 sm:w-27"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
            <PlusIcon className="size-4 text-muted-foreground group-hover:text-primary" />
          </span>
          <span className="text-xs font-medium tracking-wide text-muted-foreground">Dodaj</span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={cn("relative shrink-0", rotation)}
    >
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative flex h-26 w-21 flex-col overflow-hidden rounded-xl bg-card p-1.5 pb-2 shadow-sm ring-1 ring-border transition-all sm:h-34 sm:w-27",
          "hover:shadow-md hover:-translate-y-0.5",
          isSelected && "ring-2 ring-primary shadow-md -translate-y-0.5",
        )}
      >
        <div className="relative flex-1 overflow-hidden rounded-lg bg-muted">
          <img
            src={imageSrc}
            alt="Miniatura"
            className="size-full object-cover select-none"
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-border" />
        </div>
        {isSelected && (
          <span className="absolute z-10 right-2 top-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20">
            <CheckIcon className="size-3" strokeWidth={3} />
          </span>
        )}
      </button>

      <div
        className={cn(
          "absolute inset-x-0 -bottom-0 flex justify-center gap-2 transition-all",
          isSelected ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-1",
        )}
      >
        <TooltipTrigger delay={400}>
          <Button
            size="icon-xs"
            variant="secondary"
            onClick={onMoveLeft}
            isDisabled={!onMoveLeft}
            className="size-6 rounded-full bg-card text-card-foreground shadow-sm"
          >
            <ArrowLeft className="size-3" />
          </Button>
          <Tooltip placement="bottom">Przesuń w lewo</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger delay={400}>
          <Button
            size="icon-xs"
            variant="secondary"
            onClick={onMoveRight}
            isDisabled={!onMoveRight}
            className="size-6 rounded-full bg-card text-card-foreground shadow-sm"
          >
            <ArrowRight className="size-3" />
          </Button>
          <Tooltip placement="bottom">Przesuń w prawo</Tooltip>
        </TooltipTrigger>
      </div>
    </motion.div>
  );
}
