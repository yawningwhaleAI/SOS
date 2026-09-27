'use client';

import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { clsx } from '@/lib/clsx';

const EXTENSIONS = [
  {
    tag: 'S.O.S. RE:',
    title: 'Recycled Fibre',
    lines: ['Recovered.', 'Reprocessed.', 'Ready.'],
    body: 'The same response unit, rebuilt from fibre that has already had one life.',
    accent: 'signal' as const,
  },
  {
    tag: 'S.O.S. Bamboo',
    title: 'Bamboo Fibre',
    lines: ['Different fibre.', 'Same response.'],
    body: 'A fast-growing fibre entering the system — restrained green, unchanged standards.',
    accent: 'bamboo' as const,
  },
];

export function Sustainability() {
  return (
    <section
      id="sustainability"
      className="on-signal relative scroll-mt-20 overflow-hidden bg-ink py-20 text-bone sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.06]" />
      <div className="relative mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag index="07" title="Sustainability" tone="bone" />
        </Reveal>

        <Reveal delay={0.05}>
          <h2 className="display mt-6 max-w-4xl text-[clamp(2.4rem,6.5vw,5.5rem)] leading-[0.92] text-bone">
            The response shouldn&rsquo;t create another problem.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 max-w-xl text-lg text-bone/70">
            Sustainability isn&rsquo;t a badge we&rsquo;re bolting on. It&rsquo;s
            the next evolution of the system — two extensions currently in
            development.
          </p>
        </Reveal>

        <RevealGroup className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6">
          {EXTENSIONS.map((ext) => (
            <RevealItem key={ext.tag}>
              <article
                className={clsx(
                  'group relative flex h-full flex-col border p-6 transition-colors sm:p-8',
                  ext.accent === 'bamboo'
                    ? 'border-bamboo/60 bg-bamboo/10 hover:bg-bamboo/20'
                    : 'border-signal/60 bg-signal/10 hover:bg-signal/20',
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      'stencil text-2xl',
                      ext.accent === 'bamboo' ? 'text-bamboo' : 'text-signal',
                    )}
                  >
                    {ext.tag}
                  </span>
                  <span className="tech border border-bone/30 px-2 py-1 text-bone/60">
                    In Development
                  </span>
                </div>

                <p className="mt-6 tech text-bone/50">{ext.title}</p>
                <div className="mt-2">
                  {ext.lines.map((l) => (
                    <p
                      key={l}
                      className="display text-4xl leading-[0.95] text-bone sm:text-5xl"
                    >
                      {l}
                    </p>
                  ))}
                </div>

                <p className="mt-6 text-pretty text-bone/70">{ext.body}</p>

                <div
                  className={clsx(
                    'mt-auto pt-8',
                  )}
                >
                  <div
                    className={clsx(
                      'h-2 w-full bg-[length:22px_22px]',
                      ext.accent === 'bamboo' ? 'hazard' : 'hazard',
                    )}
                    style={
                      ext.accent === 'bamboo'
                        ? {
                            backgroundImage:
                              'repeating-linear-gradient(-45deg,#3F6B4A 0,#3F6B4A 11px,transparent 11px,transparent 22px)',
                          }
                        : {
                            backgroundImage:
                              'repeating-linear-gradient(-45deg,#F03E12 0,#F03E12 11px,transparent 11px,transparent 22px)',
                          }
                    }
                  />
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <p className="mt-8 flex items-start gap-2 border-t border-bone/15 pt-6 tech text-bone/50">
            <span aria-hidden>▲</span>
            No percentages, certifications or carbon numbers here yet. When the
            spec sheet can prove it, we&rsquo;ll print it. Not before.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
