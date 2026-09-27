import { Navigation } from '@/components/navigation/Navigation';
import { Hero } from '@/components/hero/Hero';
import { Ticker } from '@/components/ui/Ticker';
import { Problem } from '@/components/problem/Problem';
import { Society } from '@/components/story/Society';
import { Response } from '@/components/story/Response';
import { Products } from '@/components/products/Products';
import { DesignSystem } from '@/components/design-system/DesignSystem';
import { Sustainability } from '@/components/sustainability/Sustainability';
import { Attitude } from '@/components/attitude/Attitude';
import { Join } from '@/components/join/Join';
import { Footer } from '@/components/footer/Footer';

const TICKER = [
  'For Everyday Emergencies',
  'Small Disasters, Handled',
  'Response System Online',
  'Now Accepting Members',
  'Ready For Deployment',
];

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Ticker items={TICKER} tone="ink" />
        <Problem />
        <Society />
        <Response />
        <Products />
        <DesignSystem />
        <Sustainability />
        <Attitude />
        <Join />
      </main>
      <Footer />
    </>
  );
}
