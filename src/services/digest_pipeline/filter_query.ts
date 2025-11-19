import { Firestore } from 'firebase-admin/firestore';

export interface DigestQueryParams {
  date: string;
  tags?: string[];
}

export function buildDigestQuery(
  db: Firestore,
  params: DigestQueryParams,
) {
  let query = db.collection('digest_entries').where('digest_date', '==', params.date);
  if (params.tags && params.tags.length) {
    query = query.where('tags', 'array-contains-any', params.tags);
  }
  return query;
}
