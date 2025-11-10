import prisma from '@/lib/db';
import { inngest } from './client';

export const helloWorld = inngest.createFunction(
  { id: 'hello-world' },
  { event: 'test/hello.world' },
  async ({ event, step }) => {
    // fetching video
    await step.sleep('fetching', '3s');
    // transcribing
    await step.sleep('transcribing', '3s');
    // sending transcription to AI
    await step.sleep('sending-to-ai', '3s');

    await step.run('create-workflow', () => {
      return prisma.workflow.create({
        data: {
          name: 'workflow-from-inngest',
        },
      });
    });
  }
);
