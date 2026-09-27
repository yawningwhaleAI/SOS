'use client';

import { useState } from 'react';
import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal } from '@/components/ui/Reveal';
import { products, SPEC_NOTE, type Product } from '@/data/products';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';

export function Products() {
  const [active, setActive] = useState<Product | null>(null);

  return (
    <section
      id="response-units"
      className="relative scroll-mt-20 bg-signal py-24 text-ink sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <div className="relative mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag label="Response Units" code="Four Deployed" />
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8">
            <h2 className="display max-w-3xl text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] text-ink">
              We don&rsquo;t make boring products.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-4">
            <p className="text-pretty text-lg text-ink/80">
              We make everyday essentials worth keeping around — each one
              engineered, numbered and ready for deployment. Tap a unit for its
              full response file.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} onOpen={setActive} index={i} />
          ))}
        </div>

        <Reveal>
          <p className="mt-6 flex items-start gap-2 tech text-ink/70">
            <span aria-hidden>▲</span>
            {SPEC_NOTE}
          </p>
        </Reveal>
      </div>

      <ProductModal product={active} onClose={() => setActive(null)} />
    </section>
  );
}
