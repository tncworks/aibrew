import { ArticleCandidate } from '../../models/article_candidate';
import { DigestEntry } from '../../models/digest_entry';

export interface AggregatorOptions {
  maxFeatured?: number;
  digestDate?: string;
}

export interface AggregationResult {
  featured: DigestEntry[];
  readMore: DigestEntry[];
}

export function aggregateCandidates(
  candidates: ArticleCandidate[],
  options: AggregatorOptions = {},
): AggregationResult {
  const maxFeatured = options.maxFeatured ?? 10;
  const digestDate =
    options.digestDate ?? new Date().toISOString().slice(0, 10);

  const deduped = dedupeCandidates(candidates);
  const sorted = deduped.sort(compareCandidates);

  const featured: DigestEntry[] = [];
  const readMore: DigestEntry[] = [];

  sorted.forEach((candidate, index) => {
    const entry = candidateToDigestEntry(candidate, index + 1, digestDate);
    if (index < maxFeatured) {
      featured.push(entry);
    } else {
      readMore.push(entry);
    }
  });

  return { featured, readMore };
}

function dedupeCandidates(candidates: ArticleCandidate[]): ArticleCandidate[] {
  const map = new Map<string, ArticleCandidate>();
  for (const candidate of candidates) {
    const key = candidate.duplicate_group_id ?? candidate.id;
    if (!map.has(key)) {
      map.set(key, candidate);
    }
  }
  return Array.from(map.values());
}

function compareCandidates(a: ArticleCandidate, b: ArticleCandidate) {
  if (a.confidence !== b.confidence) {
    return b.confidence - a.confidence;
  }
  return (
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

function candidateToDigestEntry(
  candidate: ArticleCandidate,
  order: number,
  digestDate: string,
): DigestEntry {
  const publishedAt = new Date(candidate.published_at);
  return {
    id: candidate.id,
    digest_date: digestDate,
    order,
    title: candidate.title,
    summary: candidate.summary_draft,
    tags: candidate.tags,
    primary_source: {
      name: candidate.source_id,
      url: candidate.original_url,
    },
    related_sources: [],
    read_time_minutes: Math.max(
      1,
      Math.min(5, Math.ceil(candidate.summary_draft.length / 120)),
    ),
    published_at: publishedAt,
    updated_at: new Date(),
    visibility: 'featured',
  };
}
