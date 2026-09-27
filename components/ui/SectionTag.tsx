import { clsx } from '@/lib/clsx';

/** Institutional section label, e.g. "02 / THE PROBLEM". */
export function SectionTag({
  index,
  title,
  className,
  tone = 'ink',
}: {
  index: string;
  title: string;
  className?: string;
  tone?: 'ink' | 'bone';
}) {
  const color = tone === 'bone' ? 'text-bone' : 'text-ink';
  const rule = tone === 'bone' ? 'bg-bone/40' : 'bg-ink/30';
  return (
    <div className={clsx('flex items-center gap-3 tech', color, className)}>
      <span className="tabular-nums">{index}</span>
      <span className={clsx('h-px w-8', rule)} aria-hidden />
      <span>{title}</span>
    </div>
  );
}
