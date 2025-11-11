import { requireAuth } from '@/lib/auth-utils';
import React from 'react';

interface PageProps {
  params: Promise<{
    workflowId: string;
  }>;
}

async function WorkflowDetailPage({ params }: PageProps) {
  await requireAuth();

  const { workflowId } = await params;
  return <div>Workflow id: {workflowId}</div>;
}

export default WorkflowDetailPage;
