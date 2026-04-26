import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import AudioOntgrendelaar from '@/components/audio/AudioOntgrendelaar';
import AudioToggle from '@/components/AudioToggle';
import RotatieOverlay from '@/components/RotatieOverlay';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LetterLab',
  description: 'Leer letters, cijfers en vormen schrijven met je vinger of Apple Pencil.',
  applicationName: 'LetterLab',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LetterLab',
    startupImage: ['/icons/apple-touch-icon.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/icons/favicon-32.png',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFF8F0',
  // viewportFit: cover laat de app onder iPad notch/home-indicator door
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl" className={`${nunito.variable} h-full`}>
      <body className="h-full font-kind bg-warm-bg text-[#4A3728] overflow-hidden">
        <AudioOntgrendelaar>{children}</AudioOntgrendelaar>
        <AudioToggle />
        <RotatieOverlay />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
