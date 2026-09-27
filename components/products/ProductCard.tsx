'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import type { Product } from '@/data/products';

export function ProductCard({
  product,
  onOpen,
  index,
}: {
  product: Product;
  onOpen: (p: Product) => void;
  index: number;
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(product)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col border border-ink bg-bone text-left transition-colors duration-300 hover:bg-signal focus-visible:bg-signal"
      aria-label={`${product.name} — open response file`}
    >
      {/* header */}
      <div className="flex items-center justify-between border-b border-ink px-4 py-2.5">
        <span className="tech text-ink">Response Unit {product.responseNo}</span>
        <span className="flex items-center gap-1.5 tech text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="h-1.5 w-1.5 rounded-full bg-ink motion-safe:animate-blink" />
          Ready
        </span>
      </div>

      {/* image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bone-dim">
        <motion.div
          className="absolute inset-0"
          whileHover={reduced ? undefined : { scale: 1.06, rotate: -1.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={product.image}
            alt={`S.O.S. ${product.name} — packaging`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
        <span className="absolute left-3 top-3 tech bg-ink px-2 py-1 text-bone">
          {product.responseNo}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="display text-3xl leading-none text-ink sm:text-4xl">
          {product.name}
        </h3>
        <p className="mt-2 text-sm font-medium text-ink/70 group-hover:text-ink">
          {product.tagline}
        </p>

        {/* spec chips */}
        <div className="mt-5 flex flex-wrap gap-1.5">
          {product.specs.map((s) => (
            <span
              key={s.label}
              className="border border-ink/30 px-2 py-1 tech text-ink/70 group-hover:border-ink/60 group-hover:text-ink"
            >
              {s.value} {s.label}
            </span>
          ))}
        </div>

        {/* warning */}
        <div className="mt-auto pt-6">
          <div className="flex items-start gap-2 border-t border-ink/30 pt-3">
            <span aria-hidden className="text-ink">
              ⚠
            </span>
            <p className="tech leading-relaxed text-ink/70 group-hover:text-ink">
              Warning: {product.warning}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 tech text-ink">
            View Response File
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
