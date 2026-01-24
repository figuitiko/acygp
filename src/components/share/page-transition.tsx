"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

export function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="relative"
        initial="initial"
        animate="enter"
        exit="exit"
        variants={{
          initial: { opacity: 1 },
          enter: {
            opacity: 1,
            transition: {
              when: "beforeChildren",
              staggerChildren: 0.06,
              delayChildren: 0.05,
            },
          },
          exit: {
            opacity: 1,
            transition: { when: "afterChildren" },
          },
        }}
      >
        {/* Wipe overlay (top layer) */}
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60]"
          initial={false}
          animate="enter"
          exit="exit"
          variants={{
            enter: {
              transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
            },
            exit: {
              transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {/* First panel: sweeps in */}
          <motion.div
            className="absolute inset-0 origin-left bg-gradient-to-r from-main/95 via-main/80 to-transparent"
            variants={{
              enter: { scaleX: [0, 1, 1], opacity: [1, 1, 0] },
              exit: { scaleX: [0, 1], opacity: [1, 1] },
            }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Second panel: trailing sliver for depth */}
          <motion.div
            className="absolute inset-0 origin-left bg-gradient-to-r from-white/20 via-white/10 to-transparent mix-blend-overlay"
            variants={{
              enter: { scaleX: [0, 1], opacity: [0.8, 0] },
              exit: { scaleX: [0, 1], opacity: [0.8, 0.8] },
            }}
            transition={{
              duration: 0.55,
              delay: 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </motion.div>

        {/* Page content motion */}
        <motion.div
          className="relative"
          variants={{
            initial: {
              y: 14,
              filter: "blur(8px)",
              opacity: 0,
              scale: 0.985,
            },
            enter: {
              y: 0,
              filter: "blur(0px)",
              opacity: 1,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 260,
                damping: 28,
                mass: 0.8,
              },
            },
            exit: {
              y: -10,
              filter: "blur(10px)",
              opacity: 0,
              scale: 0.99,
              transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
            },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
