import { ImagePlusIcon } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  onClick: () => void;
};

export function ImageSlotEmpty({ onClick }: Props) {
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
        className="flex size-24 items-center justify-center rounded-lg border border-dashed border-accent bg-secondary outline-0 focus:border-solid focus:ring focus:ring-accent md:size-30"
        onClick={onClick}
      >
        <ImagePlusIcon className="text-muted-foreground" />
      </motion.button>
    </motion.div>
  );
}
