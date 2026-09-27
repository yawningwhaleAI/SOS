'use client';

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { StatusDot } from '@/components/ui/StatusDot';
import { Wordmark } from '@/components/ui/Wordmark';

export function Join() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError('Enter a valid email to enlist.');
      return;
    }
    setError('');
    setDone(true);
  };

  return (
    <section
      id="join"
      className="on-signal relative scroll-mt-20 overflow-hidden bg-signal py-20 text-ink sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
      <div className="relative mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <div className="flex items-center gap-3 tech text-ink/80">
            <span className="tabular-nums">09</span>
            <span className="h-px w-8 bg-ink/30" aria-hidden />
            <span>Join The Society</span>
          </div>
        </Reveal>

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="display text-[clamp(3rem,10vw,9rem)] leading-[0.85] text-ink">
                Join the
                <br />
                Society.
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-md text-pretty text-lg text-ink/80">
                For people who believe everyday essentials don&rsquo;t have to
                look ordinary. Enlist for first access to new response units.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal y={30}>
              <div className="border border-ink bg-bone p-6 text-ink sm:p-8">
                <div className="flex items-center justify-between border-b border-ink/20 pb-4">
                  <Wordmark className="text-3xl" />
                  <StatusDot label="Enlisting" tone="ink" />
                </div>

                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-6"
                    >
                      <p className="display text-3xl text-ink">
                        Request received.
                      </p>
                      <p className="mt-3 text-ink/70">
                        Welcome to the Society of Spills. Watch your inbox —
                        we&rsquo;ll be in touch before the next deployment.
                      </p>
                      <div className="mt-6 flex items-center gap-2 tech text-signal-deep">
                        <span aria-hidden>✚</span> Member No. Pending
                      </div>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={onSubmit}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="pt-6"
                      noValidate
                    >
                      <label
                        htmlFor="join-email"
                        className="tech text-ink/60"
                      >
                        Email Address
                      </label>
                      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                        <input
                          id="join-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@address.com"
                          className="w-full border border-ink bg-transparent px-4 py-3 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink"
                          aria-invalid={!!error}
                          aria-describedby={error ? 'join-error' : undefined}
                        />
                        <button
                          type="submit"
                          className="group inline-flex shrink-0 items-center justify-center gap-2 bg-ink px-5 py-3 tech text-bone transition-colors hover:bg-signal hover:text-ink"
                        >
                          Enter
                          <span className="transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        </button>
                      </div>
                      {error && (
                        <p
                          id="join-error"
                          className="mt-2 tech text-signal-deep"
                          role="alert"
                        >
                          {error}
                        </p>
                      )}
                      <p className="mt-4 tech text-ink/50">
                        No spam. Just deployments.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <a
                href="#response-units"
                className="group mt-4 inline-flex items-center gap-2 tech text-ink transition-colors hover:text-ink/60"
              >
                See The Response Units
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
