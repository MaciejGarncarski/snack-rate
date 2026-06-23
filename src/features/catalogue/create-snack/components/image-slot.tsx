import { ArrowLeft, ArrowRight, ImagePlusIcon } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "#/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  imageSrc?: string;
};

export function ImageSlot({ isSelected, onClick, onMoveLeft, onMoveRight, imageSrc }: Props) {
  return (
    <motion.div
      className="relative"
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      <motion.button
        className={cn(
          "flex size-24 items-center justify-center overflow-hidden rounded-lg border border-dashed border-accent bg-secondary outline-0 focus:border-solid focus:ring focus:ring-accent md:size-30",
          isSelected && "border-solid ring ring-accent",
        )}
        onClick={onClick}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="Miniatura" className="size-full object-cover" />
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
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon-xs"
                className="disabled:opacity-50"
                variant="outline"
                onClick={onMoveLeft}
                disabled={!onMoveLeft}
              />
            }
          >
            <ArrowLeft />
          </TooltipTrigger>
          <TooltipPopup side="bottom">Pzesuń w lewo</TooltipPopup>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon-xs"
                className="disabled:opacity-50"
                variant="outline"
                onClick={onMoveRight}
                disabled={!onMoveRight}
              />
            }
          >
            <ArrowRight />
          </TooltipTrigger>
          <TooltipPopup side="bottom">Pzesuń w prawo</TooltipPopup>
        </Tooltip>
      </motion.div>
    </motion.div>
  );
}
