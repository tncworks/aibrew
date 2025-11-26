import { getDb } from '../../../services/firestore/admin.js';
import { toDateOrDefault } from '../../../services/firestore/timestamp_utils.js';
import { info } from '../../../services/observability/logging.js';
import { writeMetric } from '../../../services/observability/metrics.js';
import { ArticleCandidateSchema } from '../../../models/article_candidate.js';
import {
  aggregateCandidates,
  AggregatorOptions,
} from '../../../services/digest_pipeline/aggregator.js';

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

async function recordDigestRun(slot: string, status: string) {
  const db = getDb();
  const digestDate = todayDate();
  const runId = `${digestDate}-${slot}`;
  await db.collection('digest_runs').doc(runId).set(
    {
      id: runId,
      digest_date: digestDate,
      slot,
      started_at: new Date(),
      finished_at: new Date(),
      status,
      fallback_used: status !== 'success',
    },
    { merge: true },
  );
}

export async function runPublish(slot: string) {
  const db = getDb();
  const digestDate = todayDate();
  info('publish_start', { slot, digestDate });

  const snapshot = await db
    .collection('article_candidates')
    .where('status', '==', 'approved')
    .orderBy('confidence', 'desc')
    .limit(30)
    .get();

  const candidates = snapshot.docs.map((doc) => {
    const data = doc.data();
    return ArticleCandidateSchema.parse({
      id: doc.id,
      ...data,
      fetched_at: toDateOrDefault(data.fetched_at),
      published_at: toDateOrDefault(data.published_at),
    });
  });

  const options: AggregatorOptions = { digestDate };
  const { featured, readMore } = aggregateCandidates(candidates, options);

  const digestRef = db.collection('digest_entries');

  for (const entry of featured) {
    await digestRef.doc(entry.id).set({
      ...entry,
      visibility: 'featured',
    });
  }

  for (const entry of readMore) {
    await digestRef.doc(`${entry.id}-readmore`).set({
      ...entry,
      visibility: 'read-more',
    });
  }

  await recordDigestRun(slot, 'success');
  info('publish_complete', {
    slot,
    digestDate,
    featured: featured.length,
    readMore: readMore.length,
  });
  await writeMetric({
    name: 'digest.entries.featured',
    value: featured.length,
    labels: { slot },
  });
}
