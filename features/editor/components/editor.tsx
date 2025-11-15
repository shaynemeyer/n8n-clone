'use client';

import React from 'react';
import { useSuspenseWorkflow } from '@/features/workflows/hooks/use-workflows';
import { ErrorView, LoadingView } from '@/components/entity-components';

export function EditorLoading() {
  return <LoadingView message="Loading editor..." />;
}

export function EditorError() {
  return <ErrorView message="Error loading editor" />;
}

function Editor({ workflowId }: { workflowId: string }) {
  const { data: workflow } = useSuspenseWorkflow(workflowId);

  return <p>{JSON.stringify(workflow, null, 2)}</p>;
}

export default Editor;
