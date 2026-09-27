'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';

const build = (reduced: boolean, y: number): Variants => ({
  hidden: { opacity: 0, y: reduced ? 0 : y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
});

/** Fade + slide element into view once. */
export function Reveal({
  children,
  y = 24,
  delay = 0,
  className,
  as = 'div',
  amount = 0.3,
}: {
  children: ReactNode;
  y?: number;
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'span' | 'section';
  amount?: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      variants={build(reduced, y)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Stagger container for lists of Reveal-like children. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: 'div' | 'ul' | 'section';
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </MotionTag>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'li' | 'span';
}) {
  const reduced = useReducedMotion() ?? false;
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      variants={
        reduced
          ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
          : itemVariants
      }
    >
      {children}
    </MotionTag>
  );
}
