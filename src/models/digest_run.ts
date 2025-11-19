import { z } from 'zod';

export const DigestRunSchema = z.object({
  id: z.string(),
  digest_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(['0530', '0600', '0630']),
  started_at: z.coerce.date(),
  finished_at: z.coerce.date().optional().nullable(),
  status: z.enum(['success', 'failed', 'fallback']),
  error_code: z.string().optional().nullable(),
  fallback_used: z.boolean().default(false),
});

export type DigestRun = z.infer<typeof DigestRunSchema>;
