'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Product } from '@/data/products';
import { Wordmark } from '@/components/ui/Wordmark';

export function ProductModal({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const closeRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<'front' | 'angles'>('front');

  useEffect(() => {
    setView('front');
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-stretch justify-center overflow-y-auto bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} response file`}
        >
          <motion.div
            className="relative m-auto w-full max-w-5xl border border-ink bg-bone text-ink"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* top bar */}
            <div className="flex items-center justify-between border-b border-ink bg-signal px-4 py-2 text-ink">
              <span className="tech">
                Response File / Unit {product.responseNo}
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="flex items-center gap-2 tech transition-opacity hover:opacity-70"
                aria-label="Close response file"
              >
                Close <span className="text-lg leading-none">✕</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* image */}
              <div className="relative border-b border-ink md:border-b-0 md:border-r">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-bone-dim">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Image
                        src={view === 'front' ? product.image : product.anglesImage}
                        alt={`S.O.S. ${product.name} — ${
                          view === 'front' ? 'primary studio plate' : 'field reference angles'
                        }`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <span className="absolute left-3 top-3 tech bg-ink px-2 py-1 text-bone">
                    {view === 'front' ? 'Plate 01' : 'Field Reference'}
                  </span>
                </div>
                <div className="flex border-t border-ink">
                  <button
                    type="button"
                    onClick={() => setView('front')}
                    className={`flex-1 border-r border-ink px-3 py-2 tech transition-colors ${
                      view === 'front' ? 'bg-ink text-bone' : 'hover:bg-bone-dim'
                    }`}
                  >
                    Studio Plate
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('angles')}
                    className={`flex-1 px-3 py-2 tech transition-colors ${
                      view === 'angles' ? 'bg-ink text-bone' : 'hover:bg-bone-dim'
                    }`}
                  >
                    Field Angles
                  </button>
                </div>
              </div>

              {/* details */}
              <div className="p-6 sm:p-8">
                <p className="tech text-ink/60">Response Unit {product.responseNo}</p>
                <h3 className="display mt-1 text-4xl leading-none text-ink sm:text-5xl">
                  {product.name}
                </h3>
                <p className="mt-3 text-lg font-medium text-ink/80">
                  {product.tagline}
                </p>
                <p className="mt-4 text-pretty text-ink/70">{product.blurb}</p>

                <p className="mt-6 border-l-2 border-signal pl-4 text-ink/80">
                  {product.scenario}
                </p>

                {/* specs table */}
                <dl className="mt-7 grid grid-cols-2 gap-px border border-ink bg-ink sm:grid-cols-4">
                  {product.specs.map((s) => (
                    <div key={s.label} className="bg-bone px-3 py-3 text-center">
                      <dt className="display text-2xl leading-none text-ink">
                        {s.value}
                      </dt>
                      <dd className="mt-1 tech text-ink/60">{s.label}</dd>
                    </div>
                  ))}
                </dl>

                {/* warning */}
                <div className="mt-6 border border-ink">
                  <div className="hazard h-2 w-full bg-[length:24px_24px]" />
                  <div className="flex items-start gap-3 p-4">
                    <span aria-hidden className="text-xl">
                      ⚠
                    </span>
                    <div>
                      <p className="tech text-ink/60">Warning</p>
                      <p className="mt-1 font-medium text-ink">
                        {product.warning}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-ink/20 pt-4">
                  <Wordmark className="text-2xl text-ink/70" />
                  <span className="tech text-signal-deep">
                    Small Disasters, Handled.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
