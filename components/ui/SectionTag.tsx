import { clsx } from '@/lib/clsx';

/**
 * Institutional section eyebrow — a field-file marker, no fake ordinal sequence.
 * `code` is an optional short brand reference (not a 01/02/03 counter).
 */
export function SectionTag({
  label,
  code,
  className,
  tone = 'ink',
}: {
  label: string;
  code?: string;
  className?: string;
  tone?: 'ink' | 'bone';
}) {
  const color = tone === 'bone' ? 'text-bone' : 'text-ink';
  const rule = tone === 'bone' ? 'bg-bone/40' : 'bg-ink/30';
  return (
    <div className={clsx('flex items-center gap-3 tech', color, className)}>
      <span
        aria-hidden
        className={clsx('h-2 w-2', tone === 'bone' ? 'bg-bone' : 'bg-signal')}
      />
      <span>{label}</span>
      {code && (
        <>
          <span className={clsx('h-px w-8', rule)} aria-hidden />
          <span className="opacity-60">{code}</span>
        </>
      )}
    </div>
  );
}
