import { z } from 'zod';

const SourceLiteSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  logo: z.string().url().optional(),
});

export const DigestEntrySchema = z.object({
  id: z.string(),
  digest_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  order: z.number().int().min(1).max(10),
  title: z.string().max(150),
  summary: z.string().max(300),
  tags: z.array(z.string()).max(3),
  primary_source: SourceLiteSchema,
  related_sources: z.array(SourceLiteSchema).max(3),
  read_time_minutes: z.number().min(1).max(5),
  published_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  visibility: z.enum(['featured', 'read-more', 'hidden']).default('featured'),
});

export type DigestEntry = z.infer<typeof DigestEntrySchema>;
