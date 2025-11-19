import { z } from 'zod';

export const SourceFeedSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,20}$/),
  name: z.string().min(1).max(50),
  feed_url: z.string().url(),
  category: z.enum(['tech-community', 'it-media', 'press-release']),
  last_fetched_at: z.coerce.date(),
  status: z.enum(['active', 'paused', 'blocked']),
  terms_version: z.string().min(1),
});

export type SourceFeed = z.infer<typeof SourceFeedSchema>;
