import { motion } from "motion/react";

export function ImageBlur({ src }: { src: string }) {
  return (
    <motion.img
      src={src}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full scale-125 object-cover blur-3xl opacity-60 saturate-140 brightness-130"
    />
  );
}
