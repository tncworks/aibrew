import { ArticleCandidate } from '../../models/article_candidate.js';
import { DigestEntry } from '../../models/digest_entry.js';

export interface AggregatorOptions {
  maxFeatured?: number;
}

export function aggregateCandidates(
  candidates: ArticleCandidate[],
  options: AggregatorOptions = {},
): { featured: DigestEntry[]; readMore: DigestEntry[] } {
  const maxFeatured = options.maxFeatured ?? 10;
  const featured: DigestEntry[] = [];
  const readMore: DigestEntry[] = [];

  for (const candidate of candidates) {
    const entry = candidateToDigestEntry(candidate, featured.length + 1);
    if (featured.length < maxFeatured) {
      featured.push(entry);
    } else {
      readMore.push(entry);
    }
  }

  return { featured, readMore };
}

function candidateToDigestEntry(
  candidate: ArticleCandidate,
  order: number,
): DigestEntry {
  return {
    id: candidate.id,
    digest_date: new Date().toISOString().slice(0, 10),
    order,
    title: candidate.title,
    summary: candidate.summary_draft,
    tags: candidate.tags,
    primary_source: {
      name: candidate.source_id,
      url: candidate.original_url,
    },
    related_sources: [],
    read_time_minutes: 3,
    published_at: new Date(),
    updated_at: new Date(),
    visibility: 'featured',
  };
}
