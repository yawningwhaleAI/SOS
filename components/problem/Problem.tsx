'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { Wordmark } from '@/components/ui/Wordmark';

const CASES = [
  { code: 'C-01', a: 'Coffee.', b: 'Spilled.' },
  { code: 'C-02', a: 'Sneeze.', b: 'Unexpected.' },
  { code: 'C-03', a: 'Guests.', b: 'Incoming.' },
  { code: 'C-04', a: 'Dal Tadka.', b: 'Countertop.' },
  { code: 'C-05', a: 'White Shirt.', b: 'Bad Timing.' },
  { code: 'C-06', a: 'Greasy Hands.', b: 'No Warning.' },
];

export function Problem() {
  const reduced = useReducedMotion() ?? false;
  return (
    <section
      id="problem"
      className="relative scroll-mt-20 bg-bone py-20 text-ink sm:py-28"
    >
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag index="02" title="The Problem" />
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="display mt-6 max-w-4xl text-[clamp(2.5rem,7vw,6rem)] text-ink">
            Your house is full of small emergencies.
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => (
            <RevealItem
              key={c.code}
              className="group relative flex flex-col justify-between bg-bone p-6 transition-colors duration-300 hover:bg-signal sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="tech text-ink/60 group-hover:text-ink">
                  Case {c.code}
                </span>
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-70 group-hover:bg-ink motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-signal group-hover:bg-ink" />
                </span>
              </div>
              <div className="mt-10">
                <p className="display text-4xl leading-[0.95] text-ink sm:text-5xl">
                  {c.a}
                  <br />
                  {c.b}
                </p>
                <div className="mt-4 flex items-center gap-2 tech text-ink/50 group-hover:text-ink/80">
                  <span aria-hidden>▲</span> Status: Unresolved
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* pivot statement */}
        <div className="mt-20 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8" y={30}>
            <p className="display text-[clamp(1.9rem,5vw,4rem)] leading-[0.98] text-ink">
              We have emergency services for everything.
              <span className="text-signal"> Except the small stuff.</span>
            </p>
          </Reveal>
          <Reveal className="lg:col-span-4" delay={0.1}>
            <div className="border-t-2 border-ink pt-5">
              <p className="text-lg font-medium text-ink/70">So we built one.</p>
              <motion.div
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Wordmark className="mt-2 text-6xl text-signal sm:text-7xl" />
              </motion.div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
