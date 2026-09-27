'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { StatusDot } from '@/components/ui/StatusDot';
import { Wordmark } from '@/components/ui/Wordmark';

const CASES = [
  { zone: 'Desk', a: 'Coffee.', b: 'Spilled.' },
  { zone: 'Mid-meeting', a: 'Sneeze.', b: 'Unexpected.' },
  { zone: 'Doorstep', a: 'Guests.', b: 'Incoming.' },
  { zone: 'Kitchen', a: 'Dal tadka.', b: 'Countertop.' },
  { zone: 'Wardrobe', a: 'White shirt.', b: 'Bad timing.' },
  { zone: 'Hands', a: 'Greasy.', b: 'No warning.' },
];

export function Problem() {
  const reduced = useReducedMotion() ?? false;
  return (
    <section
      id="problem"
      className="relative scroll-mt-20 bg-bone py-24 text-ink sm:py-32"
    >
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag label="The Problem" code="Field Notes" />
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="display mt-6 max-w-4xl text-[clamp(2.5rem,7vw,6rem)] text-ink">
            Your house is full of small emergencies.
          </h2>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => (
            <RevealItem
              key={c.zone + c.a}
              className="group relative flex flex-col justify-between bg-bone p-6 transition-colors duration-300 hover:bg-signal sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="tech text-ink/55 group-hover:text-ink">
                  {c.zone}
                </span>
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full rounded-full bg-signal opacity-70 group-hover:bg-ink motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-signal group-hover:bg-ink" />
                </span>
              </div>
              <p className="display mt-10 text-4xl leading-[0.95] text-ink sm:text-5xl">
                {c.a}
                <br />
                {c.b}
              </p>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* the society: story + response, folded in */}
        <div className="mt-20 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <p className="max-w-2xl text-pretty text-xl text-ink/80 sm:text-2xl">
                None of these are disasters. They&rsquo;re just emergencies
                nobody planned for — a coffee meeting a laptop, a sneeze arriving
                mid-meeting, six guests at the door.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mt-8 display text-[clamp(1.8rem,4.4vw,3.4rem)] leading-[1] text-ink">
                We have emergency services for everything.
                <span className="mt-2 block text-signal">
                  Except the small stuff.
                </span>
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-8 flex items-center gap-4 text-lg font-medium text-ink/70">
                So we built one.
                <motion.span
                  initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Wordmark className="text-4xl text-signal sm:text-5xl" />
                </motion.span>
              </p>
            </Reveal>
          </div>

          {/* membership card — the Society made tangible */}
          <div className="lg:col-span-5">
            <Reveal y={30}>
              <div className="relative border border-ink bg-signal p-6 text-ink sm:p-8">
                <div className="hazard absolute inset-x-0 top-0 h-2 bg-[length:24px_24px] opacity-90" />
                <div className="flex items-center justify-between pt-2">
                  <Wordmark className="text-4xl text-ink" />
                  <span className="tech text-ink/70">Member</span>
                </div>
                <p className="display mt-6 text-3xl text-ink">
                  Domestic Response Unit
                </p>
                <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-ink/20 pt-6">
                  <div>
                    <dt className="tech text-ink/60">Member Since</dt>
                    <dd className="text-lg font-semibold">2026</dd>
                  </div>
                  <div>
                    <dt className="tech text-ink/60">Coverage</dt>
                    <dd className="text-lg font-semibold">Small Disasters</dd>
                  </div>
                  <div>
                    <dt className="tech text-ink/60">Clearance</dt>
                    <dd className="text-lg font-semibold">Everyday</dd>
                  </div>
                  <div>
                    <dt className="tech text-ink/60">Status</dt>
                    <dd>
                      <StatusDot label="Active" tone="ink" />
                    </dd>
                  </div>
                </dl>
                <div className="mt-7 flex items-center justify-between border-t border-ink/20 pt-4 tech text-ink/70">
                  <span>No. 000001</span>
                  <span>For Everyday Emergencies</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
