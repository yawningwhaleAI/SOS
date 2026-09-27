'use client';

import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal, RevealGroup, RevealItem } from '@/components/ui/Reveal';
import { StatusDot } from '@/components/ui/StatusDot';
import { Wordmark } from '@/components/ui/Wordmark';

const LINES = [
  'Everyday life doesn’t usually go catastrophically wrong.',
  'It just gets messy.',
  'A coffee meets a laptop. A sneeze arrives mid-meeting.',
  'Dal tadka meets the countertop. Six guests arrive unannounced.',
];

export function Society() {
  return (
    <section
      id="society"
      className="on-signal relative scroll-mt-20 overflow-hidden bg-ink py-20 text-bone sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.08]" />
      <div className="relative mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag index="03" title="The Society" tone="bone" />
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="display text-[clamp(2.5rem,6.5vw,5.5rem)] text-bone">
                Welcome to the
                <br />
                Society of Spills.
              </h2>
            </Reveal>

            <RevealGroup className="mt-10 max-w-2xl space-y-4">
              {LINES.map((l, i) => (
                <RevealItem
                  key={i}
                  className="text-pretty text-xl text-bone/80 sm:text-2xl"
                >
                  {l}
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.1} className="mt-10 max-w-2xl">
              <p className="border-l-2 border-signal pl-5 text-lg text-bone/60">
                These aren&rsquo;t disasters. They&rsquo;re just emergencies
                nobody planned for.{' '}
                <span className="font-semibold text-bone">
                  S.O.S. makes the products that handle them.
                </span>
              </p>
            </Reveal>
          </div>

          {/* membership card */}
          <div className="lg:col-span-5">
            <Reveal y={30}>
              <div className="relative border border-bone/25 bg-signal p-6 text-ink sm:p-8">
                <div className="hazard absolute inset-x-0 top-0 h-2 bg-[length:24px_24px] opacity-90" />
                <div className="flex items-center justify-between pt-2">
                  <Wordmark className="text-4xl text-ink" />
                  <span className="tech text-ink/70">Member</span>
                </div>
                <p className="mt-6 tech text-ink/70">Society of Spills</p>
                <p className="display mt-1 text-3xl text-ink">
                  Domestic Response Unit
                </p>

                <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-ink/20 pt-6">
                  <div>
                    <dt className="tech text-ink/60">Member Since</dt>
                    <dd className="text-lg font-semibold">2026</dd>
                  </div>
                  <div>
                    <dt className="tech text-ink/60">Clearance</dt>
                    <dd className="text-lg font-semibold">Everyday</dd>
                  </div>
                  <div>
                    <dt className="tech text-ink/60">Coverage</dt>
                    <dd className="text-lg font-semibold">Small Disasters</dd>
                  </div>
                  <div>
                    <dt className="tech text-ink/60">Status</dt>
                    <dd>
                      <StatusDot label="Active" tone="ink" />
                    </dd>
                  </div>
                </dl>

                <div className="mt-8 flex items-center justify-between border-t border-ink/20 pt-4 tech text-ink/70">
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
