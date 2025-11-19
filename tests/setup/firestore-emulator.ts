import { Firestore } from '@google-cloud/firestore';

export function createTestFirestore(projectId = 'aibrew-test') {
  const firestore = new Firestore({
    projectId,
  });
  firestore.settings({
    host: process.env.FIRESTORE_EMULATOR_HOST ?? 'localhost:8080',
    ssl: false,
  });
  return firestore;
}
