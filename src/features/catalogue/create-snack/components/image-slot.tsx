import { ArrowLeft, ArrowRight, ImagePlusIcon } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type SlotWithImage = {
  isSelected: boolean;
  onClick: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  imageSrc?: string;
};

type EmptySlot = {
  isSelected?: never;
  onClick: () => void;
  onMoveLeft?: never;
  onMoveRight?: never;
  imageSrc?: never;
};

type Props = SlotWithImage | EmptySlot;

export function ImageSlot({ isSelected, onClick, onMoveLeft, onMoveRight, imageSrc }: Props) {
  const isEmpty = !imageSrc;

  return (
    <motion.div
      className="relative"
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      {isEmpty ? (
        <motion.button
          type="button"
          className="flex outline-none aspect-4/5 h-auto w-full items-center justify-center rounded-lg border border-dashed border-accent bg-secondary outline-0 focus:border-solid focus:ring focus:ring-ring"
          onClick={onClick}
        >
          <ImagePlusIcon className="text-muted-foreground" />
        </motion.button>
      ) : (
        <>
          <motion.button
            type="button"
            className={cn(
              "outline-none flex aspect-4/5 h-auto w-full items-center justify-center overflow-hidden rounded-lg border border-dashed border-accent bg-secondary outline-0 focus:border-solid focus:ring focus:ring-ring",
              isSelected && "border-solid ring-2 ring-primary",
            )}
            onClick={onClick}
          >
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Miniatura"
                className="size-full object-cover select-none"
                draggable={false}
              />
            ) : (
              <ImagePlusIcon className="text-muted-foreground" />
            )}
          </motion.button>
          <motion.div
            className="flex justify-between px-2 py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <TooltipTrigger>
              <Button
                size="icon-xs"
                className="disabled:opacity-50"
                variant="outline"
                onClick={onMoveLeft}
                isDisabled={!onMoveLeft}
              >
                <ArrowLeft />
              </Button>
              <Tooltip placement="bottom">Pzesuń w lewo</Tooltip>
            </TooltipTrigger>

            <TooltipTrigger>
              <Button
                size="icon-xs"
                className="disabled:opacity-50"
                variant="outline"
                onClick={onMoveRight}
                isDisabled={!onMoveRight}
              >
                <ArrowRight />
              </Button>
              <Tooltip placement="bottom">Pzesuń w prawo</Tooltip>
            </TooltipTrigger>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
