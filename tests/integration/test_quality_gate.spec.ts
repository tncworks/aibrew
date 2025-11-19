import { evaluateCandidate } from '../../src/services/quality_gate/rules.js';
import { aggregateCandidates } from '../../src/services/digest_pipeline/aggregator.js';

describe('品質ゲート統合テスト', () => {
  it('品質ゲートのfailがread-more行きの判定へつながる', () => {
    const passingCandidate = {
      id: 'pass',
      source_id: 'qiita',
      original_url: 'https://example.com/pass',
      title: 'LLMアップデートで数字が2倍',
      summary_draft: 'LLMアップデートで数値が2倍になり、性能が向上しました。'.repeat(2).slice(0, 120),
      tags: ['model-update'],
      duplicate_group_id: 'pass',
      confidence: 0.95,
      status: 'pending',
      fetched_at: new Date(),
      published_at: new Date(),
      reviewer_notes: null,
    };
    const failingCandidate = {
      ...passingCandidate,
      id: 'fail',
      title: '数字が一致しない例',
      summary_draft: 'このテキストには数値が含まれず短い',
      tags: [],
      confidence: 0.4,
    };

    const passResult = evaluateCandidate(passingCandidate);
    const failResult = evaluateCandidate(failingCandidate);

    expect(passResult.passed).toBe(true);
    expect(failResult.passed).toBe(false);

    const filtered = [passingCandidate].filter((candidate) =>
      evaluateCandidate(candidate).passed,
    );
    const { featured, readMore } = aggregateCandidates(filtered);
    expect(featured.some((entry) => entry.id === 'pass')).toBe(true);
    expect(readMore.length).toBe(0);
  });
});
