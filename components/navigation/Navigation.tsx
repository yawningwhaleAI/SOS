'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion';
import { Wordmark } from '@/components/ui/Wordmark';
import { clsx } from '@/lib/clsx';

const LINKS = [
  { label: 'The Society', href: '#society' },
  { label: 'Response Units', href: '#response-units' },
  { label: 'Our System', href: '#system' },
  { label: 'Sustainability', href: '#sustainability' },
];

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header
        className={clsx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-sos',
          scrolled
            ? 'border-b border-ink/10 bg-bone/85 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <nav
          className={clsx(
            'mx-auto flex max-w-wide items-center justify-between px-4 transition-all duration-300 ease-sos sm:px-6 lg:px-10',
            scrolled ? 'h-14' : 'h-16 sm:h-20',
          )}
          aria-label="Primary"
        >
          <a
            href="#top"
            className="group flex items-center gap-3"
            aria-label="S.O.S. — Society of Spills, back to top"
          >
            <Wordmark
              className={clsx(
                'text-ink transition-all duration-300',
                scrolled ? 'text-xl' : 'text-2xl',
              )}
            />
            <span className="hidden tech text-ink/50 sm:inline">
              Society of Spills
            </span>
          </a>

          <div className="hidden items-center gap-7 lg:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="tech text-ink/70 transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
            <a
              href="#join"
              className="group inline-flex items-center gap-2 bg-ink px-4 py-2 tech text-bone transition-colors hover:bg-signal"
            >
              Join
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 lg:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span className="tech text-ink">Menu</span>
            <span className="flex flex-col gap-[3px]" aria-hidden>
              <span className="h-[2px] w-6 bg-ink" />
              <span className="h-[2px] w-6 bg-ink" />
              <span className="h-[2px] w-4 bg-ink" />
            </span>
          </button>
        </nav>
        <motion.div
          className="h-[3px] origin-left bg-signal"
          style={{ scaleX: progress }}
        />
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="on-signal fixed inset-0 z-[60] flex flex-col bg-signal lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex h-16 items-center justify-between px-4 sm:px-6">
              <Wordmark className="text-2xl text-ink" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex items-center gap-2"
              >
                <span className="tech text-ink">Close</span>
                <span className="text-2xl leading-none text-ink">✕</span>
              </button>
            </div>
            <div className="hazard h-3 w-full bg-[length:28px_28px]" />
            <nav
              className="flex flex-1 flex-col justify-center gap-1 px-6"
              aria-label="Mobile"
            >
              {[...LINKS, { label: 'Join', href: '#join' }].map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * i + 0.1 }}
                  className="display flex items-baseline gap-4 border-b border-ink/15 py-4 text-5xl text-ink sm:text-6xl"
                >
                  <span className="tech text-base text-ink/50">
                    0{i + 1}
                  </span>
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <div className="px-6 pb-8 tech text-ink/70">
              For Everyday Emergencies.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
