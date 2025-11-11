import { requireAuth } from '@/lib/auth-utils';
import React from 'react';

async function WorkflowsPage() {
  await requireAuth();

  return <div>Workflows</div>;
}

export default WorkflowsPage;
