import { aggregateCandidates } from '../../src/services/digest_pipeline/aggregator.js';
import { evaluateCandidate } from '../../src/services/quality_gate/rules.js';

describe('ダイジェスト生成パイプライン', () => {
  it('品質ゲートを通過したcandidateのみがfeaturedに残る', () => {
    const candidates = [
      {
        id: 'good',
        source_id: 'qiita',
        original_url: 'https://example.com/good',
        title: 'LLMの新機能が３つ追加',
        summary_draft: 'LLMの新機能が3つ追加され、推論速度が向上しました。'.repeat(2).slice(0, 120),
        tags: ['model-update'],
        duplicate_group_id: 'good',
        confidence: 0.95,
        status: 'pending',
        fetched_at: new Date(),
        published_at: new Date(),
        reviewer_notes: null,
      },
      {
        id: 'bad',
        source_id: 'qiita',
        original_url: 'https://example.com/bad',
        title: '2つの数値が変わった',
        summary_draft: 'この文章は長過ぎたり短過ぎたりします。',
        tags: [],
        duplicate_group_id: 'bad',
        confidence: 0.4,
        status: 'pending',
        fetched_at: new Date(),
        published_at: new Date(),
        reviewer_notes: null,
      },
    ];

    const evaluation = candidates.map((candidate) => ({
      candidate,
      result: evaluateCandidate(candidate),
    }));

    expect(evaluation[0].result.passed).toBe(true);
    expect(evaluation[1].result.passed).toBe(false);

    const { featured, readMore } = aggregateCandidates(
      evaluation.filter((v) => v.result.passed).map((v) => v.candidate),
    );

    expect(featured).toHaveLength(1);
    expect(featured[0].id).toBe('good');
    expect(readMore).toHaveLength(0);
  });
});
