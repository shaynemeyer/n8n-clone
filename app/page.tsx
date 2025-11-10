'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import LogoutButton from './logout';
import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function HomePage() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.getWorkflows.queryOptions());

  const create = useMutation(
    trpc.createWorkflow.mutationOptions({
      onSuccess: () => {
        toast.success('Job queued');
      },
    })
  );

  return (
    <div className="min-h-screen min-w-screen flex items-center justify-center gap-y-6 flex-col">
      <div>protected server component</div>
      {JSON.stringify(data, null, 2)}
      <Button onClick={() => create.mutate()} disabled={create.isPending}>
        Create workflow
      </Button>
      <div>
        <LogoutButton />
      </div>
    </div>
  );
}

export default HomePage;
