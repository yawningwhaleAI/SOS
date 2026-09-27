import { clsx } from '@/lib/clsx';

/** Infinite marquee band. Content duplicated for seamless loop. */
export function Ticker({
  items,
  className,
  tone = 'ink',
  separator = '✳',
}: {
  items: string[];
  className?: string;
  tone?: 'ink' | 'signal' | 'bone';
  separator?: string;
}) {
  const base =
    tone === 'signal'
      ? 'bg-signal text-ink'
      : tone === 'bone'
        ? 'bg-bone text-ink'
        : 'bg-ink text-bone';
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="tech whitespace-nowrap px-6 py-0.5">{t}</span>
          <span aria-hidden className="opacity-50">
            {separator}
          </span>
        </span>
      ))}
    </div>
  );
  return (
    <div
      className={clsx('overflow-hidden py-2', base, className)}
      role="marquee"
      aria-hidden
    >
      <div className="flex w-max motion-safe:animate-marquee motion-reduce:animate-none">
        {row}
        {row}
      </div>
    </div>
  );
}
