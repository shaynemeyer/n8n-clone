import SignupForm from '@/app/features/auth/components/signup-form';
import { requireUnauth } from '@/lib/auth-utils';
import React from 'react';

async function SignupPage() {
  await requireUnauth();

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="min-w-100">
        <SignupForm />
      </div>
    </div>
  );
}

export default SignupPage;
