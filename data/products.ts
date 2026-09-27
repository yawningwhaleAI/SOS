export type Spec = { value: string; label: string };

export type Product = {
  /** stable id / slug */
  id: string;
  /** response unit number, e.g. "01" — a real product inventory sequence */
  responseNo: string;
  name: string;
  /** short deck line — unique per unit */
  tagline: string;
  /** one-line witty description — unique per unit */
  blurb: string;
  /** the emergency this unit responds to */
  scenario: string;
  /** always four axes, same order across every unit: Count · Ply · Sheet · GSM */
  specs: Spec[];
  /** unique warning line per unit */
  warning: string;
  /** primary studio image in /public/products */
  image: string;
  /** contact-sheet of alternate angles */
  anglesImage: string;
};

/**
 * GSM and the two missing sheet sizes are INDICATIVE industry values pending final
 * mill certification (Facial 42 GSM is confirmed on-pack). Swap real figures here when
 * certified — nothing else needs to change. See SPEC_NOTE below.
 */
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
  },
  {
    id: 'pocket-tissues',
    responseNo: '02',
    name: 'Pocket Tissues',
    tagline: 'Ten-sheet backup for ambushes.',
    blurb: 'A full response unit that vanishes into a pocket.',
    scenario: 'For ambushes, allergies and inconvenient timing.',
    specs: [
      { value: '10', label: 'Sheets' },
      { value: '3', label: 'Ply' },
      { value: '21×21', label: 'cm Sheet' },
      { value: '45', label: 'GSM' },
    ],
    warning: 'May be required when your nose has other plans.',
    image: '/products/pocket-tissues.webp',
    anglesImage: '/products/pocket-tissues-angles.webp',
  },
  {
    id: 'kitchen-rolls',
    responseNo: '03',
    name: 'Kitchen Rolls',
    tagline: 'Spills, messes, dal tadka — met.',
    blurb: 'High-absorbency backup for the busiest room in the house.',
    scenario: 'For when dal tadka meets countertop.',
    specs: [
      { value: '2', label: 'Rolls' },
      { value: '2', label: 'Ply' },
      { value: '22×23', label: 'cm Sheet' },
      { value: '40', label: 'GSM' },
    ],
    warning: 'May be required after dal tadka meets countertop.',
    image: '/products/kitchen-rolls.webp',
    anglesImage: '/products/kitchen-rolls-angles.webp',
  },
  {
    id: 'car-tissues',
    responseNo: '04',
    name: 'Car Tissues',
    tagline: 'Composure, glovebox-sized.',
    blurb: 'A cylinder of composure for the console.',
    scenario: 'For when coffee meets speed breaker.',
    specs: [
      { value: '80', label: 'Sheets' },
      { value: '2', label: 'Ply' },
      { value: '20×20', label: 'cm Sheet' },
      { value: '42', label: 'GSM' },
    ],
    warning: 'May be required after coffee meets speed breaker.',
    image: '/products/car-tissues.webp',
    anglesImage: '/products/car-tissues-angles.webp',
  },
];

/** Shown once near the spec panels — honest about the indicative figures. */
export const SPEC_NOTE =
  'Specifications are indicative and finalised per production batch. Facial GSM confirmed on-pack.';

export const productById = (id: string) => products.find((p) => p.id === id);
