import { Queue } from 'bullmq';

export const evalQueue = new Queue('eval', {
  connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
});
