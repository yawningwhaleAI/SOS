import { clsx } from '@/lib/clsx';

/** Blinking emergency-ready indicator. */
export function StatusDot({
  label = 'System Ready',
  tone = 'signal',
  className,
}: {
  label?: string;
  tone?: 'signal' | 'ink' | 'bone';
  className?: string;
}) {
  const dot =
    tone === 'signal'
      ? 'bg-signal'
      : tone === 'bone'
        ? 'bg-bone'
        : 'bg-ink';
  return (
    <span className={clsx('inline-flex items-center gap-2 tech', className)}>
      <span className="relative flex h-2 w-2" aria-hidden>
        <span
          className={clsx(
            'absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping',
            dot,
          )}
        />
        <span className={clsx('relative inline-flex h-2 w-2 rounded-full', dot)} />
      </span>
      {label}
    </span>
  );
}
