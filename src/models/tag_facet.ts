import { z } from 'zod';

export const TagFacetSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string().max(120),
  color: z.string().optional(),
  active: z.boolean().default(true),
});

export type TagFacet = z.infer<typeof TagFacetSchema>;
