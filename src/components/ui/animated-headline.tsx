"use client";

import { motion, useReducedMotion } from "framer-motion";

export function AnimatedHeadline() {
  const reducedMotion = useReducedMotion();

  return (
    <h1 className="text-5xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-7xl lg:text-[5.5rem]">
      <motion.span
        className="block"
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        Same answer.
      </motion.span>
      <motion.span
        className="block text-text-secondary"
        initial={reducedMotion ? false : { opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: reducedMotion ? 0 : 0.08,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        Different minds.
      </motion.span>
    </h1>
  );
}
