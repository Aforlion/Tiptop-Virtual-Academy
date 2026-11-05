import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tiptop Virtual Academy | Premier British & International Online School',
  description:
    'Accredited British Curriculum online education for ages 3–16 (EYFS to IGCSE) with small-group live interactive classes, on-demand masterclasses, and Nigerian curriculum integration. Paystack verified.',
  keywords: [
    'virtual school',
    'british curriculum online',
    'online school nigeria',
    'igcse online courses',
    'tiptop virtual academy',
    'uk virtual school',
    'homeschooling uk curriculum',
    'pearson edexcel online'
  ],
  openGraph: {
    title: 'Tiptop Virtual Academy | British Education Anywhere',
    description: 'Bespoke online British schooling with interactive cohorts capped at 10–12 students. Paystack verified.',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
