import { DigestEntrySchema } from '../../src/models/digest_entry.js';
import { aggregateCandidates } from '../../src/services/digest_pipeline/aggregator.js';

describe('ダイジェスト契約', () => {
  it('DigestEntry schemaは仕様通りのpayloadを受け入れる', () => {
    const payload = {
      id: 'entry-1',
      digest_date: '2024-05-01',
      order: 1,
      title: 'テストタイトル',
      summary: 'これは100文字以内のサマリーです',
      tags: ['model-update'],
      primary_source: { name: 'Qiita', url: 'https://qiita.com/' },
      related_sources: [],
      read_time_minutes: 3,
      published_at: new Date(),
      updated_at: new Date(),
      visibility: 'featured',
    };
    expect(() => DigestEntrySchema.parse(payload)).not.toThrow();
  });

  it('aggregateCandidatesは最大10件をfeaturedに揃え、残りをread-moreへ送る', () => {
    const candidates = Array.from({ length: 12 }).map((_, index) => ({
      id: `cand-${index}`,
      source_id: 'qiita',
      original_url: `https://example.com/${index}`,
      title: `タイトル${index}`,
      summary_draft: 'これは要約です'.repeat(5),
      tags: ['model-update'],
      duplicate_group_id: `group-${index}`,
      confidence: 0.9 - index * 0.01,
      status: 'pending',
      fetched_at: new Date(),
      published_at: new Date(),
      reviewer_notes: null,
    }));

    const { featured, readMore } = aggregateCandidates(candidates);
    expect(featured).toHaveLength(10);
    expect(readMore).toHaveLength(2);
    expect(featured[0].order).toBe(1);
    expect(readMore[0].order).toBeGreaterThan(10);
  });
});
