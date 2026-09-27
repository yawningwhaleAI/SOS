export type Spec = { value: string; label: string };

export type Product = {
  /** stable id / slug */
  id: string;
  /** response unit number, e.g. "01" */
  responseNo: string;
  name: string;
  /** short deck line shown on card + hero of modal */
  tagline: string;
  /** one-line witty description */
  blurb: string;
  /** the emergency this unit responds to */
  scenario: string;
  specs: Spec[];
  warning: string;
  /** primary studio image in /public/products */
  image: string;
  /** contact-sheet of alternate angles */
  anglesImage: string;
  /** image aspect ratio (w/h) for layout stability */
  ratio: number;
};

export const products: Product[] = [
  {
    id: 'facial-tissues',
    responseNo: '01',
    name: 'Facial Tissues',
    tagline: 'Strong. Soft. Always ready.',
    blurb: 'A box of calm for the small moments that need it.',
    scenario: 'For sneezes, spills and sudden emotional weather.',
    specs: [
      { value: '100', label: 'Sheets' },
      { value: '2', label: 'Ply' },
      { value: '20×20', label: 'cm Sheet' },
      { value: '42', label: 'GSM' },
    ],
    warning: 'May cause sudden emotional relief.',
    image: '/products/face-tissues.webp',
    anglesImage: '/products/face-tissues-angles.webp',
    ratio: 1536 / 1024,
  },
  {
    id: 'pocket-tissues',
    responseNo: '02',
    name: 'Pocket Tissues',
    tagline: 'For when your nose has other plans.',
    blurb: 'A full response unit that disappears into a pocket.',
    scenario: 'For ambushes, allergies and inconvenient timing.',
    specs: [
      { value: '10', label: 'Sheets' },
      { value: '3', label: 'Ply' },
      { value: 'Pocket', label: 'Format' },
      { value: 'Soft', label: 'On Skin' },
    ],
    warning: 'May be required when your nose has other plans.',
    image: '/products/pocket-tissues.webp',
    anglesImage: '/products/pocket-tissues-angles.webp',
    ratio: 1374 / 1145,
  },
  {
    id: 'kitchen-rolls',
    responseNo: '03',
    name: 'Kitchen Rolls',
    tagline: 'Spills. Messes. Always ready.',
    blurb: 'High-absorbency backup for the busiest room in the house.',
    scenario: 'For when dal tadka meets countertop.',
    specs: [
      { value: '2', label: 'Rolls' },
      { value: '2', label: 'Ply' },
      { value: '22×23', label: 'cm Sheet' },
      { value: 'High', label: 'Absorbency' },
    ],
    warning: 'May be required after dal tadka meets countertop.',
    image: '/products/kitchen-rolls.webp',
    anglesImage: '/products/kitchen-rolls-angles.webp',
    ratio: 1536 / 1024,
  },
  {
    id: 'car-tissues',
    responseNo: '04',
    name: 'Car Tissues',
    tagline: 'Strong. Soft. Always ready.',
    blurb: 'A cylinder of composure for the glovebox.',
    scenario: 'For when coffee meets speed breaker.',
    specs: [
      { value: '80', label: 'Sheets' },
      { value: '2', label: 'Ply' },
      { value: '20×20', label: 'cm Sheet' },
      { value: 'Console', label: 'Fit' },
    ],
    warning: 'May be required after coffee meets speed breaker.',
    image: '/products/car-tissues.webp',
    anglesImage: '/products/car-tissues-angles.webp',
    ratio: 1536 / 1024,
  },
];

export const productById = (id: string) => products.find((p) => p.id === id);
