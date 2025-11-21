import type { NodeExecutor } from '@/features/executions/types';

type HttpRequestData = Record<string, unknown>;

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  nodeId,
  context,
  step,
}) => {
  // TODO: Publish "loading" state for http request

  const result = await step.run('http-request', async () => context);

  // TODO: Publish "success" state for http request

  return result;
};
