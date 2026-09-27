'use client';

import { useState } from 'react';
import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal } from '@/components/ui/Reveal';
import { Wordmark } from '@/components/ui/Wordmark';
import { clsx } from '@/lib/clsx';

type ZoneId =
  | 'mark'
  | 'unit'
  | 'specs'
  | 'warning'
  | 'hazard'
  | 'signal';

const ANATOMY: { id: ZoneId; term: string; body: string }[] = [
  {
    id: 'mark',
    term: 'The Stencil Mark',
    body: 'Military stencil, built to be read across a messy room. Selective, never decorative.',
  },
  {
    id: 'unit',
    term: 'Response Number',
    body: 'Every product is numbered like field equipment. 01 through 04, and counting.',
  },
  {
    id: 'specs',
    term: 'Specification Panel',
    body: 'Sheets. Ply. Size. GSM. The facts, framed like an instrument label.',
  },
  {
    id: 'warning',
    term: 'Warning Box',
    body: 'The honesty and the joke in one line. Every unit ships with exactly one.',
  },
  {
    id: 'hazard',
    term: 'Hazard Stripes',
    body: 'Borrowed from real emergency signage. Their only job: pay attention.',
  },
  {
    id: 'signal',
    term: 'Signal Orange',
    body: 'One colour does all the shouting, so everything else can stay calm.',
  },
];

export function DesignSystem() {
  const [active, setActive] = useState<ZoneId | null>(null);
  const dim = (id: ZoneId) =>
    clsx(
      'transition-all duration-300',
      active && active !== id ? 'opacity-30' : 'opacity-100',
      active === id ? 'ring-2 ring-offset-2 ring-offset-signal ring-ink' : '',
    );

  return (
    <section
      id="system"
      className="relative scroll-mt-20 bg-bone py-20 text-ink sm:py-28"
    >
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag index="06" title="The Design System" />
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-7">
            <h2 className="display text-[clamp(2.5rem,7vw,6rem)] leading-[0.9]">
              Boring products.
              <br />
              <span className="text-signal">Unboring system.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-5">
            <p className="text-pretty text-lg text-ink/70">
              We treat packaging like signage. Every colour, number, warning and
              stripe has a job. Hover the anatomy to see who does what.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          {/* replica packaging */}
          <Reveal y={30}>
            <div
              className="on-signal relative select-none border border-ink bg-signal p-5 text-ink sm:p-7"
              onMouseLeave={() => setActive(null)}
            >
              {/* signal orange field marker */}
              <div className={clsx('absolute inset-0 -z-0', dim('signal'))} />
              <div className="relative z-10 grid grid-cols-1 gap-5 sm:grid-cols-[1.1fr_1fr]">
                {/* left: brand */}
                <div className="flex flex-col justify-between">
                  <p className="tech">Society of Spills</p>
                  <div className={dim('mark')}>
                    <Wordmark className="text-6xl sm:text-7xl" />
                  </div>
                  <p className="mt-3 text-sm font-semibold tracking-wide">
                    FOR EVERYDAY EMERGENCIES.
                  </p>
                </div>

                {/* right: spec label */}
                <div className="border border-ink bg-bone p-3">
                  <div className={clsx('flex items-baseline gap-2', dim('unit'))}>
                    <span className="display text-2xl">01</span>
                    <span className="text-sm font-bold tracking-wide">
                      — FACIAL TISSUES
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-ink/70">
                    STRONG. SOFT. ALWAYS READY.
                  </p>
                  <div
                    className={clsx(
                      'mt-3 grid grid-cols-4 gap-px border border-ink bg-ink text-center',
                      dim('specs'),
                    )}
                  >
                    {[
                      ['100', 'SHEETS'],
                      ['2', 'PLY'],
                      ['20×20', 'CM'],
                      ['42', 'GSM'],
                    ].map(([v, l]) => (
                      <div key={l} className="bg-bone px-1 py-1.5">
                        <p className="text-sm font-bold leading-none">{v}</p>
                        <p className="mt-0.5 text-[8px] font-semibold tracking-wider text-ink/60">
                          {l}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div
                    className={clsx(
                      'mt-3 flex items-center gap-2 border border-ink px-2 py-1.5',
                      dim('warning'),
                    )}
                  >
                    <span aria-hidden>⚠</span>
                    <span className="text-[9px] font-semibold tracking-wide">
                      WARNING: MAY CAUSE SUDDEN EMOTIONAL RELIEF.
                    </span>
                  </div>
                </div>
              </div>
              {/* hazard edge */}
              <div
                className={clsx(
                  'absolute right-0 top-0 h-full w-6 hazard bg-[length:18px_18px]',
                  dim('hazard'),
                )}
              />
            </div>
          </Reveal>

          {/* anatomy list */}
          <div className="flex flex-col divide-y divide-ink/15 border-y border-ink/15">
            {ANATOMY.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onMouseEnter={() => setActive(a.id)}
                onFocus={() => setActive(a.id)}
                onMouseLeave={() => setActive(null)}
                onBlur={() => setActive(null)}
                className={clsx(
                  'group flex items-start gap-4 py-4 text-left transition-colors sm:py-5',
                  active === a.id ? 'text-ink' : 'text-ink/70',
                )}
              >
                <span className="tech w-8 shrink-0 pt-1 text-ink/50">
                  0{i + 1}
                </span>
                <span className="flex-1">
                  <span className="display block text-2xl leading-none sm:text-3xl">
                    {a.term}
                  </span>
                  <span className="mt-2 block text-sm text-ink/60">
                    {a.body}
                  </span>
                </span>
                <span
                  className={clsx(
                    'pt-1 text-signal transition-transform duration-300',
                    active === a.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0',
                  )}
                  aria-hidden
                >
                  ◀
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
