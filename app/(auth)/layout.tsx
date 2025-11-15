import React from 'react';
import AuthLayout from '../../features/auth/components/auth-layout';

function Layout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}

export default Layout;
