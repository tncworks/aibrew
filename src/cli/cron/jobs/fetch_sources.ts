import crypto from 'crypto';
import { getDb } from '../../../services/firestore/admin.js';
import { loadConfig } from '../../../services/config/index.js';
import { info } from '../../../services/observability/logging.js';
import { writeMetric } from '../../../services/observability/metrics.js';
import { SourceFeed, SourceFeedSchema } from '../../../models/source_feed.js';

type MockArticle = {
  title: string;
  url: string;
  tags: string[];
  publishedAt: Date;
  summary: string;
};

const MOCK_FEEDS: SourceFeed[] = [
  {
    id: 'qiita',
    name: 'Qiita',
    feed_url: 'https://qiita.com/tags/generative-ai/feed',
    category: 'tech-community',
    last_fetched_at: new Date(),
    status: 'active',
    terms_version: '2024-07',
  },
  {
    id: 'zenn',
    name: 'Zenn',
    feed_url: 'https://zenn.dev/topics/generative-ai/feed',
    category: 'tech-community',
    last_fetched_at: new Date(),
    status: 'active',
    terms_version: '2024-07',
  },
];

function buildMockArticles(feed: SourceFeed): MockArticle[] {
  return [
    {
      title: `${feed.name} で話題の生成AIアップデート`,
      url: `${feed.feed_url}?id=${crypto.randomUUID()}`,
      tags: ['model-update'],
      publishedAt: new Date(),
      summary: '生成AIのアップデートについてのダイジェスト。',
    },
  ];
}

export async function runFetchSources(slot: string) {
  const db = getDb();
  const cfg = loadConfig();

  info('fetch_sources_start', { slot });

  for (const feed of MOCK_FEEDS) {
    const validated = SourceFeedSchema.parse(feed);
    await db.collection('source_feeds').doc(validated.id).set({
      ...validated,
      last_fetched_at: new Date(),
    });

    const articles = buildMockArticles(validated);
    for (const article of articles) {
      const docId = crypto.randomUUID();
      await db.collection('article_candidates').doc(docId).set({
        id: docId,
        source_id: validated.id,
        original_url: article.url,
        title: article.title,
        summary_draft: article.summary,
        tags: article.tags,
        duplicate_group_id: crypto
          .createHash('sha1')
          .update(article.url)
          .digest('hex'),
        confidence: 0,
        status: 'pending',
        fetched_at: new Date(),
        published_at: article.publishedAt,
        slot,
        ingest_project: cfg.firestore.projectId,
      });
    }
  }

  info('fetch_sources_complete', { slot, feeds: MOCK_FEEDS.length });
  await writeMetric({
    name: 'fetch_sources.count',
    value: MOCK_FEEDS.length,
    labels: { slot },
  });
}
