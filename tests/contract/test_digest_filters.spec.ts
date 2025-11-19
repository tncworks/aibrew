import { buildDigestQuery } from '../../src/services/digest_pipeline/filter_query.js';

class FakeQuery {
  constructor(public clauses: Array<{ field: string; op: string; value: unknown }> = []) {}

  where(field: string, op: string, value: unknown) {
    this.clauses.push({ field, op, value });
    return this;
  }

  get() {
    return this;
  }
}

class FakeFirestore {
  lastQuery: FakeQuery | null = null;

  collection() {
    this.lastQuery = new FakeQuery();
    return this.lastQuery;
  }
}

describe('ダイジェストフィルタ契約', () => {
  it('タグを指定した場合は array-contains-any クエリが組み立てられる', () => {
    const db = new FakeFirestore();
    const query = buildDigestQuery(db as any, { date: '2024-05-01', tags: ['model-update', 'community'] });

    expect(query.clauses).toEqual([
      { field: 'digest_date', op: '==', value: '2024-05-01' },
      { field: 'tags', op: 'array-contains-any', value: ['model-update', 'community'] },
    ]);
  });

  it('タグ指定が無い場合は日付フィルタのみ', () => {
    const db = new FakeFirestore();
    const query = buildDigestQuery(db as any, { date: '2024-05-01' });
    expect(query.clauses).toEqual([{ field: 'digest_date', op: '==', value: '2024-05-01' }]);
  });
});
