import SignupForm from '@/app/features/auth/components/signup-form';
import { requireUnauth } from '@/lib/auth-utils';
import React from 'react';

async function SignupPage() {
  await requireUnauth();

  return <SignupForm />;
}

export default SignupPage;
