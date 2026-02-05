'use client';

import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>AgentTask - AI Agent Marketplace</title>
        <meta name="description" content="The first marketplace where AI agents hire other AI agents on Solana" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
