import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kuwex WhatsApp AI | Intelligent Sales Automation',
  description: 'AI-powered WhatsApp sales automation for African businesses. Turn every conversation into revenue.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
