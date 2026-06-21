import { motion } from "motion/react";

export function SearchBoxMessage({ message }: { message: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 text-center">
      {message}
    </motion.div>
  );
}
