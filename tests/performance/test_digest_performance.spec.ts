import { performance } from 'node:perf_hooks';
import { aggregateCandidates } from '@/services/digest_pipeline/aggregator';

type Candidate = Parameters<typeof aggregateCandidates>[0][number];

function buildCandidates(count: number): Candidate[] {
  return Array.from({ length: count }).map((_, index) => ({
    id: `cand-${index}`,
    source_id: 'qiita',
    original_url: `https://example.com/${index}`,
    title: `LLMの数値が${index}向上`,
    summary_draft: 'LLMの改善で読了時間が5分以内になりました。'.repeat(4).slice(0, 140),
    tags: ['model-update'],
    duplicate_group_id: `group-${Math.floor(index / 2)}`,
    confidence: 0.8 - index * 0.001,
    status: 'approved',
    fetched_at: new Date(),
    published_at: new Date(),
    reviewer_notes: null,
  }));
}

describe('Digest performance (p95 < 800ms)', () => {
  it('50件の候補を100回集計しても800ms未満で完了する', () => {
    const candidates = buildCandidates(50);
    const start = performance.now();
    for (let i = 0; i < 100; i += 1) {
      aggregateCandidates(candidates);
    }
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(800);
  });
});
