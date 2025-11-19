#!/usr/bin/env ts-node

import { getDb } from '../services/firestore/admin.js';
import { TagFacetSchema } from '../models/tag_facet.js';

const DEFAULT_TAGS = [
  { id: 'model-update', label: 'モデル更新', description: 'LLM/GPUモデルの更新情報' },
  { id: 'new-tools', label: '新ツール', description: '生成AIツール/サービス' },
  { id: 'industry-insight', label: '業界動向', description: '導入事例や市場分析' },
  { id: 'regulation', label: '規制動向', description: '法規制やガイドライン' },
  { id: 'community', label: 'コミュニティ', description: 'Qiita/Zenn等の投稿' },
];

async function main() {
  const db = getDb();
  for (const tag of DEFAULT_TAGS) {
    const parsed = TagFacetSchema.parse(tag);
    await db.collection('tag_facets').doc(parsed.id).set(parsed, { merge: true });
    console.info(`Seeded tag: ${parsed.id}`);
  }
  console.info('Tag facets seeding completed.');
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
