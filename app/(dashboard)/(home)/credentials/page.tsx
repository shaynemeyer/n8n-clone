import { requireAuth } from '@/lib/auth-utils';
import React from 'react';

async function CredentialsPage() {
  await requireAuth();

  return <div>Credentials</div>;
}

export default CredentialsPage;
