import { requireAuth } from '@/lib/auth-utils';
import React from 'react';

async function ExecutionsPage() {
  await requireAuth();

  return <div>Executions</div>;
}

export default ExecutionsPage;
