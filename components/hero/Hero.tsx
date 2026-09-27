'use client';

import Image from 'next/image';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { StatusDot } from '@/components/ui/StatusDot';
import { Wordmark } from '@/components/ui/Wordmark';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const line: Variants = {
  hidden: { opacity: 0, y: '110%' },
  show: {
    opacity: 1,
    y: '0%',
    transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  },
};

const soft: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section
      id="top"
      className="on-signal relative flex min-h-[100svh] flex-col overflow-hidden bg-signal pt-16 text-ink sm:pt-20"
    >
      {/* faint grid */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.5]" />
      {/* corner registration marks */}
      <CornerMarks />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto flex w-full max-w-wide flex-1 flex-col px-4 sm:px-6 lg:px-10"
      >
        {/* top status row */}
        <motion.div
          variants={soft}
          className="flex items-center justify-between border-b border-ink/20 py-3"
        >
          <StatusDot label="Response System Online" tone="ink" />
          <span className="hidden tech text-ink/70 lg:inline">
            Issue No. 01 — Domestic Response Unit
          </span>
          <span className="hidden tech text-ink/70 sm:inline">
            Est. 2026 / India
          </span>
        </motion.div>

        {/* main grid */}
        <div className="grid flex-1 grid-cols-1 items-center gap-8 py-8 lg:grid-cols-12 lg:gap-6 lg:py-6">
          {/* type column */}
          <div className="lg:col-span-7">
            <motion.div variants={soft} className="mb-5">
              <span className="tech inline-flex items-center gap-2 border border-ink/30 px-3 py-1 text-ink/80">
                <span aria-hidden>▲</span> Emergency Services — For The Small
                Stuff
              </span>
            </motion.div>

            <h1 className="display text-ink">
              <span className="sr-only">
                S.O.S. — For everyday emergencies.
              </span>
              <span className="block overflow-hidden" aria-hidden>
                <motion.span variants={line} className="block">
                  <Wordmark className="text-[clamp(4.5rem,16vw,13rem)]" />
                </motion.span>
              </span>
              <span
                aria-hidden
                className="mt-1 block text-[clamp(2.6rem,8.5vw,7rem)] leading-[0.9]"
              >
                <span className="block overflow-hidden">
                  <motion.span variants={line} className="block">
                    For Everyday
                  </motion.span>
                </span>
                <span className="block overflow-hidden">
                  <motion.span variants={line} className="block">
                    Emergencies.
                  </motion.span>
                </span>
              </span>
            </h1>

            <motion.p
              variants={soft}
              className="mt-6 max-w-md text-pretty text-base text-ink/80 sm:text-lg"
            >
              The Society of Spills makes beautifully over-engineered household
              essentials for life&rsquo;s small disasters. Now accepting
              members.
            </motion.p>

            <motion.div
              variants={soft}
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <a
                href="#join"
                className="group inline-flex items-center justify-center gap-3 bg-ink px-6 py-4 tech text-bone transition-colors hover:bg-bone hover:text-ink"
              >
                Enter The Society
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
              <a
                href="#response-units"
                className="group inline-flex items-center justify-center gap-3 border border-ink px-6 py-4 tech text-ink transition-colors hover:bg-ink hover:text-bone"
              >
                See The Response Units
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </motion.div>
          </div>

          {/* product plate */}
          <motion.div
            variants={reduced ? soft : undefined}
            initial={reduced ? undefined : { opacity: 0, y: 40, scale: 0.96 }}
            animate={reduced ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <div className="relative">
              {/* label strip */}
              <div className="flex items-center justify-between border border-ink bg-bone px-3 py-1.5">
                <span className="tech text-ink">Plate 01 / Facial Tissues</span>
                <StatusDot label="Ready" tone="ink" />
              </div>
              <div className="relative aspect-[3/2] w-full overflow-hidden border-x border-b border-ink">
                <Image
                  src="/products/face-tissues.webp"
                  alt="S.O.S. Facial Tissues — Signal Orange box with stencil branding, photographed on a kitchen counter"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
                {/* hazard corner */}
                <div className="hazard-bone absolute right-0 top-0 h-14 w-14 opacity-90" />
              </div>
              <div className="flex items-stretch border-x border-b border-ink">
                <div className="flex-1 border-r border-ink px-3 py-2">
                  <p className="tech text-ink/60">Designation</p>
                  <p className="font-semibold">Domestic Response Unit</p>
                </div>
                <div className="px-3 py-2">
                  <p className="tech text-ink/60">Status</p>
                  <p className="font-semibold text-signal-deep">Deployed</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* scroll indicator */}
      <motion.a
        href="#problem"
        variants={soft}
        initial="hidden"
        animate="show"
        transition={{ delay: 1.1 }}
        className="group relative z-10 mx-auto mb-4 flex items-center gap-3 tech text-ink/80"
        aria-label="Scroll to respond"
      >
        Scroll To Respond
        <motion.span
          aria-hidden
          animate={reduced ? {} : { y: [0, 5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          ↓
        </motion.span>
      </motion.a>
    </section>
  );
}

function CornerMarks() {
  const mark = 'absolute h-5 w-5 border-ink/40';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-4 sm:inset-6">
      <span className={`${mark} left-0 top-0 border-l-2 border-t-2`} />
      <span className={`${mark} right-0 top-0 border-r-2 border-t-2`} />
      <span className={`${mark} bottom-0 left-0 border-b-2 border-l-2`} />
      <span className={`${mark} bottom-0 right-0 border-b-2 border-r-2`} />
    </div>
  );
}
