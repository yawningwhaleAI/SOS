import { clsx } from '@/lib/clsx';

/** A thin animated hazard-stripe bar used as a section divider. */
export function HazardBar({
  className,
  variant = 'ink',
  animate = true,
}: {
  className?: string;
  variant?: 'ink' | 'bone' | 'signal';
  animate?: boolean;
}) {
  const hz =
    variant === 'bone'
      ? 'hazard-bone'
      : variant === 'signal'
        ? 'hazard-signal'
        : 'hazard';
  return (
    <div
      role="separator"
      aria-hidden
      className={clsx(
        'h-3 w-full bg-[length:28px_28px]',
        hz,
        animate && 'motion-safe:animate-hazard-slide',
        className,
      )}
    />
  );
}
