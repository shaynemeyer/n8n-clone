import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted flex justify-center items-center flex-col min-h-svh gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image src="/logos/logo.svg" alt="n8n-clone" width={30} height={30} />
          n8n-clone
        </Link>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
