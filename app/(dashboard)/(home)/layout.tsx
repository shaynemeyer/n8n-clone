import AppHeader from '@/components/app-header';
import React from 'react';

function RestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}

export default RestLayout;
