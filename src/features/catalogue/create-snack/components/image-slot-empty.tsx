import { ImagePlusIcon } from "lucide-react";
import { motion } from "motion/react";

type Props = {
  onClick: () => void;
};

export function ImageSlotEmpty({ onClick }: Props) {
  return (
    <motion.div
      className="relative"
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <motion.button
        type="button"
        className="flex aspect-4/5 h-auto w-24 items-center justify-center rounded-lg border border-dashed border-accent bg-secondary outline-0 focus:border-solid focus:ring focus:ring-accent md:w-28"
        onClick={onClick}
      >
        <ImagePlusIcon className="text-muted-foreground" />
      </motion.button>
    </motion.div>
  );
}
