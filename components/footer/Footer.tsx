import { Wordmark } from '@/components/ui/Wordmark';
import { HazardBar } from '@/components/ui/HazardBar';

const COLS = [
  {
    title: 'Response Units',
    links: [
      { label: 'Facial Tissues', href: '#response-units' },
      { label: 'Pocket Tissues', href: '#response-units' },
      { label: 'Kitchen Rolls', href: '#response-units' },
      { label: 'Car Tissues', href: '#response-units' },
    ],
  },
  {
    title: 'The Society',
    links: [
      { label: 'Our Story', href: '#society' },
      { label: 'Our System', href: '#system' },
      { label: 'Why S.O.S.', href: '#why' },
    ],
  },
  {
    title: 'System',
    links: [
      { label: 'Sustainability', href: '#sustainability' },
      { label: 'S.O.S. RE:', href: '#sustainability' },
      { label: 'S.O.S. Bamboo', href: '#sustainability' },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'hello@societyofspills.com', href: 'mailto:hello@societyofspills.com' },
      { label: 'Join The Society', href: '#join' },
      { label: 'Back To Top', href: '#top' },
    ],
  },
];

/** Faux EAN barcode rendered as bars — echoes the packaging. */
function Barcode() {
  const widths = [2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 4, 1, 2];
  return (
    <div aria-hidden className="flex items-end gap-[2px]">
      {widths.map((w, i) => (
        <span
          key={i}
          className="block bg-bone"
          style={{ width: `${w}px`, height: i % 5 === 0 ? '38px' : '30px' }}
        />
      ))}
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-signal bg-ink text-bone">
      <HazardBar variant="signal" animate={false} />
      <div className="mx-auto max-w-wide px-4 py-14 sm:px-6 lg:px-10">
        {/* top */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Wordmark className="text-6xl text-signal" />
            <p className="mt-3 tech text-bone/60">Society of Spills</p>
            <p className="display mt-4 text-2xl leading-tight text-bone">
              For Everyday
              <br />
              Emergencies.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
            {COLS.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="tech text-bone/50">{c.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-bone/80 transition-colors hover:text-signal"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* technical strip */}
        <div className="mt-14 grid grid-cols-2 gap-6 border-t border-bone/15 pt-8 sm:grid-cols-4">
          <div>
            <p className="tech text-bone/40">Issue No.</p>
            <p className="mt-1 font-semibold">01</p>
          </div>
          <div>
            <p className="tech text-bone/40">Member Since</p>
            <p className="mt-1 font-semibold">2026</p>
          </div>
          <div>
            <p className="tech text-bone/40">Designation</p>
            <p className="mt-1 font-semibold">Domestic Response Unit</p>
          </div>
          <div className="flex flex-col items-start justify-end">
            <Barcode />
            <p className="mt-1 tech text-bone/40">8 906123 456789</p>
          </div>
        </div>

        {/* base */}
        <div className="mt-10 flex flex-col gap-2 border-t border-bone/15 pt-6 tech text-bone/50 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Society of Spills. All rights reserved.</span>
          <span>Small Disasters, Handled.</span>
        </div>
      </div>
    </footer>
  );
}
