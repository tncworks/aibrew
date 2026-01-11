#!/usr/bin/env node
import { getDb } from '../services/firestore/admin.js';
import { loadConfig } from '../services/config/index.js';

async function verifyData() {
  console.log('========== Firestore データ確認 ==========\n');
  
  const cfg = loadConfig();
  console.log(`環境: ${cfg.name}`);
  console.log(`Firestoreプロジェクト: ${cfg.firestore.projectId}`);
  
  if (cfg.firestore.emulatorHost) {
    console.log(`エミュレータ: ${cfg.firestore.emulatorHost}`);
  }
  console.log();

  const db = getDb();

  try {
    // source_feedsコレクションを確認
    console.log('--- source_feeds コレクション ---');
    const feedsSnapshot = await db.collection('source_feeds').get();
    console.log(`ドキュメント数: ${feedsSnapshot.size}件`);
    
    feedsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id}: ${data.name} (${data.status})`);
    });
    console.log();

    // article_candidatesコレクションを確認
    console.log('--- article_candidates コレクション ---');
    const candidatesSnapshot = await db.collection('article_candidates').limit(10).get();
    console.log(`ドキュメント数: ${candidatesSnapshot.size}件 (最大10件表示)`);
    
    candidatesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${doc.id.substring(0, 8)}...`);
      console.log(`    タイトル: ${data.title}`);
      console.log(`    ソース: ${data.source_id}`);
      console.log(`    ステータス: ${data.status}`);
      console.log(`    タグ: ${data.tags?.join(', ') || 'なし'}`);
    });
    console.log();

    console.log('========== 確認完了 ==========');
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
}

verifyData().catch(console.error);
