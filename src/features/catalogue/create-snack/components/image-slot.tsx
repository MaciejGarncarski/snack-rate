import { ArrowLeft, ArrowRight, ImagePlusIcon } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "#/components/ui/button";
import { Tooltip, TooltipPopup, TooltipTrigger } from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  imageSrc?: string;
};

export function ImageSlot({ isSelected, onClick, imageSrc }: Props) {
  return (
    <div className="relative">
      <button
        className={cn(
          "flex size-30 items-center justify-center overflow-hidden rounded-lg border border-dashed border-accent bg-secondary outline-0 focus:border-solid focus:ring focus:ring-accent",
          isSelected && "border-solid ring ring-accent",
        )}
        onClick={onClick}
      >
        {imageSrc ? (
          <img src={imageSrc} alt="Miniatura" className="size-full object-cover" />
        ) : (
          <ImagePlusIcon className="text-muted-foreground" />
        )}
      </button>
      <motion.div className="flex justify-between px-2 py-2">
        <Tooltip>
          <TooltipTrigger render={<Button size="icon-xs" />}>
            <ArrowLeft />
          </TooltipTrigger>
          <TooltipPopup side="bottom">Pzesuń w lewo</TooltipPopup>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button size="icon-xs" />}>
            <ArrowRight />
          </TooltipTrigger>
          <TooltipPopup side="bottom">Pzesuń w prawo</TooltipPopup>
        </Tooltip>
      </motion.div>
    </div>
  );
}
