'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SectionTag } from '@/components/ui/SectionTag';
import { Reveal } from '@/components/ui/Reveal';

type Spot = {
  no: string;
  align: 'left' | 'right';
  lines: { text: string; signal?: boolean }[];
};

const SPOTS: Spot[] = [
  { no: '01', align: 'left', lines: [{ text: 'Life spills.' }, { text: 'We show up.', signal: true }] },
  {
    no: '02',
    align: 'right',
    lines: [
      { text: 'Your house is not' },
      { text: 'an emergency room.' },
      { text: 'But sometimes it feels like one.', signal: true },
    ],
  },
  { no: '03', align: 'left', lines: [{ text: 'Small disasters.' }, { text: 'Handled.', signal: true }] },
];

function Statement({ spot }: { spot: Spot }) {
  const reduced = useReducedMotion() ?? false;
  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={spot.align === 'right' ? 'text-left sm:text-right' : 'text-left'}
    >
      <span className="tech text-ink/40">Spot {spot.no}</span>
      <p className="display mt-3 text-[clamp(2.4rem,9vw,8rem)] leading-[0.88]">
        {spot.lines.map((l, i) => (
          <span
            key={i}
            className={l.signal ? 'block text-signal' : 'block text-ink'}
          >
            {l.text}
          </span>
        ))}
      </p>
    </motion.div>
  );
}

export function Attitude() {
  return (
    <section
      id="why"
      className="relative scroll-mt-20 overflow-hidden bg-bone py-20 text-ink sm:py-28"
    >
      <div className="mx-auto max-w-wide px-4 sm:px-6 lg:px-10">
        <Reveal>
          <SectionTag index="08" title="Why S.O.S." />
        </Reveal>
        <div className="mt-14 space-y-16 sm:space-y-24">
          {SPOTS.map((s) => (
            <Statement key={s.no} spot={s} />
          ))}
        </div>
      </div>
    </section>
  );
}
