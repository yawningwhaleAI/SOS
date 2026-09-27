import type { Metadata, Viewport } from 'next';
import { Anton, Archivo, Saira_Stencil_One, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const display = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Archivo({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const stencil = Saira_Stencil_One({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-stencil',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const SITE_URL = 'https://society-of-spills.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'S.O.S. — Society of Spills | For Everyday Emergencies',
  description:
    "S.O.S. makes beautifully designed everyday household essentials for life's small emergencies.",
  applicationName: 'Society of Spills',
  keywords: [
    'S.O.S.',
    'Society of Spills',
    'tissues',
    'kitchen rolls',
    'design-led household essentials',
    'everyday emergencies',
  ],
  authors: [{ name: 'Society of Spills' }],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Society of Spills',
    title: 'S.O.S. — Society of Spills | For Everyday Emergencies',
    description:
      'The emergency-response system for everyday life. Small disasters, handled.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'S.O.S. — Society of Spills. For everyday emergencies.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S.O.S. — Society of Spills',
    description: 'The emergency-response system for everyday life.',
    images: ['/og.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#F03E12',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${stencil.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
