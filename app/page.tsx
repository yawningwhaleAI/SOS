import { Navigation } from '@/components/navigation/Navigation';
import { Hero } from '@/components/hero/Hero';
import { Ticker } from '@/components/ui/Ticker';
import { Problem } from '@/components/problem/Problem';
import { Products } from '@/components/products/Products';
import { DesignSystem } from '@/components/design-system/DesignSystem';
import { Sustainability } from '@/components/sustainability/Sustainability';
import { Join } from '@/components/join/Join';
import { Footer } from '@/components/footer/Footer';

const TICKER = [
  'For Everyday Emergencies',
  'Small Disasters, Handled',
  'Now Accepting Members',
  'Ready For Deployment',
];

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        {/* 01 — Hero */}
        <Hero />
        {/* single marquee — a signature, run once */}
        <Ticker items={TICKER} tone="ink" />
        {/* 02 — The Problem (+ the Society, folded in) */}
        <Problem />
        {/* 03 — Response Units (products) */}
        <Products />
        {/* 04 — The System (packaging anatomy + sustainability band) */}
        <DesignSystem />
        <Sustainability />
        {/* 05 — Join (consumer + trade) */}
        <Join />
      </main>
      <Footer />
    </>
  );
}
