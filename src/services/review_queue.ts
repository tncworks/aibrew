import { getDb } from './firestore/admin';
import { ArticleCandidateSchema } from '../models/article_candidate';
import { Timestamp } from 'firebase-admin/firestore';

const REVIEW_COLLECTION = 'editorial_reviews';

// Convert Firestore Timestamp to Date
function toDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }
  return null;
}

export async function listPendingCandidates(limit = 20) {
  const db = getDb();
  const snapshot = await db
    .collection('article_candidates')
    .where('status', 'in', ['pending', 'rejected'])
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return ArticleCandidateSchema.parse({
      id: doc.id,
      ...data,
      fetched_at: toDate(data.fetched_at) ?? new Date(),
      published_at: toDate(data.published_at) ?? new Date(),
    });
  });
}

export async function approveCandidate(candidateId: string, reviewerId: string, notes?: string) {
  const db = getDb();
  const candidateRef = db.collection('article_candidates').doc(candidateId);
  await candidateRef.update({ status: 'approved', reviewer_notes: notes ?? '' });
  await logReview(candidateId, reviewerId, 'approve', notes);
}

export async function rejectCandidate(candidateId: string, reviewerId: string, comment: string) {
  const db = getDb();
  const candidateRef = db.collection('article_candidates').doc(candidateId);
  await candidateRef.update({ status: 'rejected', reviewer_notes: comment });
  await logReview(candidateId, reviewerId, 'reject', comment);
}

async function logReview(candidateId: string, reviewerId: string, action: 'approve' | 'reject', comment?: string) {
  const db = getDb();
  await db.collection(REVIEW_COLLECTION).add({
    candidate_id: candidateId,
    reviewer_id: reviewerId,
    action,
    comment,
    created_at: new Date(),
  });
}
