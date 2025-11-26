import { z } from 'zod';

const dateSchema = z.preprocess((arg) => {
  if (typeof arg === 'object' && arg !== null && 'toDate' in arg && typeof (arg as any).toDate === 'function') {
    return (arg as any).toDate();
  }
  return arg;
}, z.coerce.date());

export const ArticleCandidateSchema = z.object({
  id: z.string().min(1),
  source_id: z.string(),
  original_url: z.string().url().max(255),
  title: z.string().max(150),
  summary_draft: z.string().max(300),
  tags: z.array(z.string()).max(3),
  duplicate_group_id: z.string(),
  confidence: z.number().min(0).max(1),
  status: z.enum(['pending', 'approved', 'rejected']),
  fetched_at: dateSchema,
  published_at: dateSchema,
  reviewer_notes: z.string().max(500).nullable().optional(),
});

export type ArticleCandidate = z.infer<typeof ArticleCandidateSchema>;
