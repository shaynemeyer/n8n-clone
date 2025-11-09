import LoginForm from '@/app/features/auth/components/login-form';
import { requireUnauth } from '@/lib/auth-utils';
import React from 'react';

async function LoginPage() {
  await requireUnauth();

  return <LoginForm />;
}

export default LoginPage;
