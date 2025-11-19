import { evaluateCandidate } from '../../src/services/quality_gate/rules.js';

describe('品質ゲート契約', () => {
  it('十分な要約とタグがあればpassする', () => {
    const candidate = {
      id: 'cand-1',
      source_id: 'qiita',
      original_url: 'https://example.com',
      title: 'LLMの数値は3つ向上',
      summary_draft:
        'LLMが3つの改善を達成し応答速度が20%向上し読了時間が5分以内になりました。'.repeat(
          4,
        ).slice(0, 140),
      tags: ['model-update'],
      duplicate_group_id: 'group-1',
      confidence: 0.92,
      status: 'pending',
      fetched_at: new Date(),
      published_at: new Date(),
      reviewer_notes: null,
    };
    const result = evaluateCandidate(candidate);
    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
    expect(result.score).toBeGreaterThan(0.8);
  });

  it('要約文字数不足やタグ欠落でfailする', () => {
    const candidate = {
      id: 'cand-2',
      source_id: 'qiita',
      original_url: 'https://example.com',
      title: '2つの数字が変わった',
      summary_draft: '短い要約',
      tags: [],
      duplicate_group_id: 'group-2',
      confidence: 0.4,
      status: 'pending',
      fetched_at: new Date(),
      published_at: new Date(),
      reviewer_notes: null,
    };
    const result = evaluateCandidate(candidate);
    expect(result.passed).toBe(false);
    expect(result.issues.length).toBeGreaterThanOrEqual(1);
    expect(result.score).toBeLessThan(0.75);
  });
});
