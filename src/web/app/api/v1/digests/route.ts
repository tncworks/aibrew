import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../services/firestore/admin.js';
import { loadConfig } from '../../../../../services/config/index.js';
import { info } from '../../../../../services/observability/logging.js';
import { writeMetric } from '../../../../../services/observability/metrics.js';
import { buildDigestQuery } from '../../../../../services/digest_pipeline/filter_query.js';

type DigestRunStatus = {
  latestSuccessSlot: string | null;
  fallbackActive: boolean;
  bannerMessage?: string;
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const db = getDb();
  const cfg = loadConfig();
  const url = new URL(request.url);
  const dateParam = url.searchParams.get('date') ?? today();
  const tagParam = url.searchParams.get('tags');
  const searchKeyword = url.searchParams.get('search');

  info('api_digests_request', { date: dateParam, tags: tagParam });

  const tags = tagParam ? tagParam.split(',').filter(Boolean) : [];
  const query = buildDigestQuery(db, { date: dateParam, tags });

  const snapshot = await query.get();

  const featured: any[] = [];
  const readMore: any[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    if (searchKeyword && !matchSearch(data, searchKeyword)) {
      return;
    }
    if (data.visibility === 'read-more') {
      readMore.push(data);
    } else {
      featured.push(data);
    }
  });

  const status = await buildRunStatus(dateParam);

  if (tags.length) {
    await writeMetric({
      name: 'digest.filter.tags',
      value: tags.length,
      labels: { tags: tags.join(',') },
    });
  }

  return NextResponse.json({
    date: dateParam,
    entries: featured,
    readMore,
    status,
    config: { region: cfg.cloudRun.region },
  });
}

async function buildRunStatus(date: string): Promise<DigestRunStatus> {
  const db = getDb();
  const runs = await db
    .collection('digest_runs')
    .where('digest_date', '==', date)
    .orderBy('slot')
    .get();

  if (runs.empty) {
    return {
      latestSuccessSlot: null,
      fallbackActive: true,
      bannerMessage: '07:00版の生成を完了できませんでした。最新号は準備中です。',
    };
  }

  const success = runs.docs.filter((doc) => doc.data().status === 'success');
  const latest = success.at(-1);

  return {
    latestSuccessSlot: latest ? latest.data().slot : null,
    fallbackActive: !latest,
    bannerMessage: latest ? undefined : '前日のダイジェストを表示しています。',
  };
}

function matchSearch(entry: any, keyword: string) {
  const lower = keyword.toLowerCase();
  return (
    entry.title?.toLowerCase().includes(lower) ||
    entry.summary?.toLowerCase().includes(lower)
  );
}
