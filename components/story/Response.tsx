'use client';

import Image from 'next/image';
import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal } from '@/components/ui/Reveal';
import { products } from '@/data/products';

export function Response() {
  return (
    <section
      id="response"
      className="relative scroll-mt-20 bg-bone py-20 text-ink sm:py-28"
    >
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag index="04" title="Our Response" />
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8">
            <h2 className="display text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] text-ink">
              We don&rsquo;t make
              <br />
              boring products.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="text-pretty text-lg text-ink/70">
              We make everyday essentials{' '}
              <span className="font-semibold text-ink">
                worth keeping around.
              </span>{' '}
              Each one is a Response Unit — engineered, numbered and ready for
              deployment.
            </p>
          </Reveal>
        </div>
      </div>

      {/* horizontal rail */}
      <div className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 no-scrollbar sm:gap-6 sm:px-6 lg:px-10">
        {products.map((p) => (
          <a
            key={p.id}
            href="#response-units"
            className="group relative w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[31vw] xl:w-[24rem]"
          >
            <div className="relative aspect-[4/5] overflow-hidden border border-ink bg-bone-dim">
              <Image
                src={p.image}
                alt={`S.O.S. ${p.name} packaging`}
                fill
                sizes="(max-width: 640px) 78vw, (max-width: 1024px) 46vw, 24rem"
                className="object-cover transition-transform duration-700 ease-sos group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-16">
                <p className="tech text-bone/80">
                  Response Unit {p.responseNo}
                </p>
                <p className="display mt-1 text-2xl text-bone sm:text-3xl">
                  {p.name}
                </p>
                <p className="mt-1 text-sm text-bone/80">{p.tagline}</p>
              </div>
              <span className="absolute right-3 top-3 tech bg-signal px-2 py-1 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Deploy →
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
