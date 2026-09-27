'use client';

import { Reveal } from '@/components/ui/Reveal';
import { clsx } from '@/lib/clsx';

const EXTENSIONS = [
  {
    tag: 'S.O.S. RE:',
    fibre: 'Recycled fibre',
    line: 'Recovered. Reprocessed. Ready.',
    accent: 'signal' as const,
  },
  {
    tag: 'S.O.S. Bamboo',
    fibre: 'Bamboo fibre',
    line: 'Different fibre. Same response.',
    accent: 'bamboo' as const,
  },
];

/**
 * Compact band — the tail of "The System", not a full section. Frames
 * sustainability as the next evolution of the kit. No invented claims.
 */
export function Sustainability() {
  return (
    <section
      id="sustainability"
      aria-label="Sustainability — system extensions"
      className="on-signal scroll-mt-20 border-t border-ink/15 bg-bone pb-24 pt-4 text-ink sm:pb-32"
    >
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-6">
            <p className="tech text-ink/55">The system, evolving</p>
            <h3 className="display mt-3 text-[clamp(1.9rem,4.5vw,3.4rem)] leading-[1] text-ink">
              The response shouldn&rsquo;t create another problem.
            </h3>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-6">
            <p className="text-pretty text-ink/70">
              Two fibre extensions are in development — same standards, lighter
              footprint. No percentages or certifications printed until the spec
              sheet can prove them.
            </p>
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {EXTENSIONS.map((e) => (
            <Reveal key={e.tag}>
              <div
                className={clsx(
                  'flex items-center justify-between border p-5 sm:p-6',
                  e.accent === 'bamboo'
                    ? 'border-bamboo/50 bg-bamboo/5'
                    : 'border-ink/25 bg-signal/5',
                )}
              >
                <div>
                  <span
                    className={clsx(
                      'stencil text-xl',
                      e.accent === 'bamboo' ? 'text-bamboo' : 'text-signal',
                    )}
                  >
                    {e.tag}
                  </span>
                  <p className="mt-1 font-medium text-ink">{e.line}</p>
                  <p className="mt-0.5 tech text-ink/50">{e.fibre}</p>
                </div>
                <span className="tech shrink-0 border border-ink/30 px-2 py-1 text-ink/60">
                  In Dev
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
