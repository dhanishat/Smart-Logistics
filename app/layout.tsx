import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { StoreProvider } from '@/lib/store';
import { LanguageProvider } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DemoController from '@/components/DemoController';

export const metadata: Metadata = {
  title: 'NE RoadSense | North East India Smart Logistics & Road Hazard Platform',
  description:
    'AI-powered road hazard detection, dynamic vehicle-specific passability intelligence, and automated rerouting for North Eastern India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="bg-[#090D16] text-slate-100 min-h-screen flex flex-col selection:bg-emerald-500 selection:text-black">
        <LanguageProvider>
          <StoreProvider>
            <Navbar />
            <main className="flex-1 pb-24 md:pb-20">{children}</main>
            <DemoController />
            <Footer />
          </StoreProvider>
        </LanguageProvider>

        {/* Hidden Google Translate element for broad web translation bridge */}
        <div id="google_translate_element" className="hidden" />
      </body>
    </html>
  );
}
