'use client';

import { useState } from 'react';
import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal } from '@/components/ui/Reveal';
import { products, type Product } from '@/data/products';
import { ProductCard } from './ProductCard';
import { ProductModal } from './ProductModal';

export function Products() {
  const [active, setActive] = useState<Product | null>(null);

  return (
    <section
      id="response-units"
      className="relative scroll-mt-20 bg-signal py-20 text-ink sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <div className="relative mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag index="05" title="Response Units" />
        </Reveal>

        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal>
            <h2 className="display max-w-3xl text-[clamp(2.5rem,7vw,6rem)] leading-[0.9] text-ink">
              Four units.
              <br />
              Deployed daily.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-xs text-ink/80">
              Tap any unit to open its response file — specs, warnings and field
              references included.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
          {products.map((p, i) => (
            <ProductCard key={p.id} product={p} onOpen={setActive} index={i} />
          ))}
        </div>
      </div>

      <ProductModal product={active} onClose={() => setActive(null)} />
    </section>
  );
}
