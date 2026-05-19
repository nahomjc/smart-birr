/** Shared Framer Motion variants for the landing page. */

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

export const barRise = (index: number) => ({
  hidden: { scaleY: 0, opacity: 0.4 },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: {
      duration: 0.9,
      delay: index * 0.07,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
});

export const viewportOnce = { once: true, margin: "-80px" as const };

export const springSoft = { type: "spring" as const, stiffness: 120, damping: 20 };
