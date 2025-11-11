import { requireAuth } from '@/lib/auth-utils';
import React from 'react';

interface PageProps {
  params: Promise<{
    executionId: string;
  }>;
}

async function ExecutionDetailPage({ params }: PageProps) {
  await requireAuth();

  const { executionId } = await params;
  return <div>Execution id: {executionId}</div>;
}

export default ExecutionDetailPage;
