import React from 'react';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gov-surface text-gov-text-primary">
      <PublicHeader />
      <main className="flex-1 w-full">{children}</main>
      <PublicFooter />
    </div>
  );
};
