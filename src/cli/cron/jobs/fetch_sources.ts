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

export async function runFetchSources(slot: string, dryRun: boolean = false) {
  const cfg = loadConfig();

  info('fetch_sources_start', { slot, dryRun });
  console.log(`\n========== データ取得開始 (slot: ${slot}) ==========`);
  if (dryRun) {
    console.log('⚠️  DRY-RUN モード: 実際のデータ保存は行いません\n');
  }

  const db = dryRun ? null : getDb();

  for (const feed of MOCK_FEEDS) {
    console.log(`\nフィード処理中: ${feed.name} (${feed.id})`);
    const validated = SourceFeedSchema.parse(feed);
    
    if (dryRun) {
      console.log(`  [DRY-RUN] source_feedsコレクションに保存する予定: ${validated.id}`);
    } else {
      await db!.collection('source_feeds').doc(validated.id).set({
        ...validated,
        last_fetched_at: new Date(),
      });
      console.log(`  ✓ source_feedsコレクションに保存: ${validated.id}`);
    }

    const articles = buildMockArticles(validated);
    console.log(`  記事数: ${articles.length}件`);
    
    for (const article of articles) {
      const docId = crypto.randomUUID();
      const articleData = {
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
      };
      
      if (dryRun) {
        console.log(`  [DRY-RUN] article_candidatesに保存する予定:`);
      } else {
        await db!.collection('article_candidates').doc(docId).set(articleData);
        console.log(`  ✓ article_candidatesに保存:`);
      }
      console.log(`    - ID: ${docId}`);
      console.log(`    - タイトル: ${article.title}`);
      console.log(`    - URL: ${article.url}`);
      console.log(`    - タグ: ${article.tags.join(', ')}`);
    }
  }

  console.log(`\n========== データ取得完了 ==========`);
  console.log(`処理フィード数: ${MOCK_FEEDS.length}件\n`);

  info('fetch_sources_complete', { slot, feeds: MOCK_FEEDS.length, dryRun });
  await writeMetric({
    name: 'fetch_sources.count',
    value: MOCK_FEEDS.length,
    labels: { slot, dryRun: dryRun ? 'true' : 'false' },
  });
}

// スタンドアロン実行のためのエントリポイント
if (import.meta.url === `file://${process.argv[1]}`) {
  const slot = process.env.DIGEST_SLOT ?? '0530';
  const dryRun = process.argv.includes('--dry-run') || !process.env.FIRESTORE_EMULATOR_HOST;
  
  if (dryRun && !process.argv.includes('--dry-run')) {
    console.log('⚠️  FIRESTORE_EMULATOR_HOSTが設定されていないため、DRY-RUNモードで実行します');
    console.log('   実際にデータを保存するには、Firestoreエミュレータを起動して環境変数を設定してください\n');
  }
  
  runFetchSources(slot, dryRun)
    .then(() => {
      console.log('✓ 処理が正常に完了しました');
      process.exit(0);
    })
    .catch((err) => {
      console.error('✗ エラーが発生しました:', err);
      process.exit(1);
    });
}
