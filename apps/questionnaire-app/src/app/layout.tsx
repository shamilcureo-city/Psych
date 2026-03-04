import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PsychAssess — Mental Health Assessment',
  description: 'Scientifically validated psychological assessments and counseling',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        {children}
      </body>
    </html>
  );
}
