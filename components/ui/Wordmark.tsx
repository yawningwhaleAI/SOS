import { clsx } from '@/lib/clsx';

/** The S.O.S. stencil lockup. */
export function Wordmark({
  className,
  as: Tag = 'span',
}: {
  className?: string;
  as?: 'span' | 'div' | 'h1';
}) {
  return (
    <Tag
      className={clsx('stencil leading-none tracking-[0.02em]', className)}
      aria-label="S.O.S."
    >
      S.O.S.
    </Tag>
  );
}
