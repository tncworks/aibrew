import { getDb } from '../../../services/firestore/admin.js';
import { toDateOrDefault } from '../../../services/firestore/timestamp_utils.js';
import { generateSummary, factCheckSummary } from '../../../services/llm/vertex_client.js';
import { info } from '../../../services/observability/logging.js';
import { writeMetric } from '../../../services/observability/metrics.js';
import { ArticleCandidateSchema } from '../../../models/article_candidate.js';
import { evaluateCandidate } from '../../../services/quality_gate/rules.js';
import { enqueueRetry, shouldRetry } from '../../../services/quality_gate/retry_queue.js';

const BATCH_LIMIT = Number(process.env.SUMMARY_BATCH_LIMIT ?? '10');

function buildPrompt(title: string, url: string) {
  return `元記事: ${url}\nタイトル: ${title}\n100〜150字で日本語要約を作成し、重要なポイントを3つ抽出してください。`;
}

function deriveTags(title: string): string[] {
  const lower = title.toLowerCase();
  const tags: string[] = [];
  if (lower.includes('モデル') || lower.includes('model')) tags.push('model-update');
  if (lower.includes('サービス') || lower.includes('service')) tags.push('new-tools');
  if (lower.includes('事例')) tags.push('industry-insight');
  return tags.slice(0, 3);
}

export async function runSummarize(slot: string) {
  const db = getDb();
  info('summarize_start', { slot });
  const snapshot = await db
    .collection('article_candidates')
    .where('status', '==', 'pending')
    .limit(BATCH_LIMIT)
    .get();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const candidate = ArticleCandidateSchema.parse({
      id: doc.id,
      ...data,
      fetched_at: toDateOrDefault(data.fetched_at),
      published_at: toDateOrDefault(data.published_at),
    });

    const prompt = buildPrompt(candidate.title, candidate.original_url);
    const summary = await generateSummary(prompt);
    const factCheck = await factCheckSummary(summary);
    const tags = deriveTags(candidate.title);
    const confidence =
      factCheck && !factCheck.includes('不確か') ? 0.9 : 0.6;

    const evaluation = evaluateCandidate({
      ...candidate,
      summary_draft: summary,
      tags: tags.length ? tags : candidate.tags,
      confidence,
    });

    const canRetry = await shouldRetry(candidate.id);
    const nextStatus = evaluation.passed
      ? 'approved'
      : canRetry
      ? 'pending'
      : 'rejected';

    await doc.ref.update({
      summary_draft: summary,
      tags: tags.length ? tags : candidate.tags,
      confidence: evaluation.score,
      status: nextStatus,
      fact_check_notes: factCheck,
      quality_issues: evaluation.issues,
    });

    if (!evaluation.passed) {
      await enqueueRetry(candidate.id);
    }
  }

  info('summarize_complete', { slot, processed: snapshot.size });
  await writeMetric({
    name: 'summaries.processed',
    value: snapshot.size,
    labels: { slot },
  });
}
