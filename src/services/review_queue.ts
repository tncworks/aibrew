import { getDb } from './firestore/admin.js';
import { ArticleCandidateSchema } from '../models/article_candidate.js';

const REVIEW_COLLECTION = 'editorial_reviews';

export async function listPendingCandidates(limit = 20) {
  const db = getDb();
  const snapshot = await db
    .collection('article_candidates')
    .where('status', 'in', ['pending', 'rejected'])
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ArticleCandidateSchema.parse({ id: doc.id, ...doc.data() }));
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
