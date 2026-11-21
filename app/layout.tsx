// ==============================================================================
// MEETWISE AI — ROOT APP LAYOUT
// Team Meteor — Product Space AI Agentic Hackathon
// ==============================================================================

import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'MEETWISE AI — From Conversations to Completed Actions',
  description:
    'AI-powered team execution platform featuring Decision DNA, Conflict Radar, and Proof Before Action task verification.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
