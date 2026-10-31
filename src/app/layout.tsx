import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gatherly AI — Every celebration, thoughtfully planned.',
  description:
    'AI-powered celebration and event planning workspace for Indian and global events. Structured budgets, task timelines, vendor tracker, and personalized ideas.',
  keywords: [
    'event planner',
    'wedding planning',
    'birthday planner',
    'AI event assistant',
    'Indian celebration budget',
    'event checklist',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="FR1fFH6GlS8cEw4jXnj67sC6d-obQeuYDd06I7ehioA" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#FAF7F2] text-[#182620]"
      >
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
