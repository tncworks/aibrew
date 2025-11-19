import { getDb } from '../../services/firestore/admin.js';

const MAX_ATTEMPTS = 3;

export async function enqueueRetry(candidateId: string) {
  const db = getDb();
  const ref = db.collection('quality_retries').doc(candidateId);
  const snapshot = await ref.get();
  const attempts = snapshot.exists ? (snapshot.data()?.attempts ?? 0) + 1 : 1;
  await ref.set({ attempts, updated_at: new Date() });
  return attempts;
}

export async function shouldRetry(candidateId: string) {
  const db = getDb();
  const ref = db.collection('quality_retries').doc(candidateId);
  const snapshot = await ref.get();
  const attempts = snapshot.exists ? snapshot.data()?.attempts ?? 0 : 0;
  return attempts < MAX_ATTEMPTS;
}
