'use client';

import React from 'react';
import { useSuspenseWorkflows } from '../hooks/use-workflows';

function WorkflowsList() {
  const workflows = useSuspenseWorkflows();

  return <p>{JSON.stringify(workflows.data, null, 2)}</p>;
}

export default WorkflowsList;
