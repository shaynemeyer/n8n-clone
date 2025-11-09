import LoginForm from '@/app/features/auth/components/login-form';
import { requireUnauth } from '@/lib/auth-utils';
import React from 'react';

async function LoginPage() {
  await requireUnauth();

  return (
    <div className="flex items-center justify-center h-screen w-full">
      <div className="min-w-100">
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
