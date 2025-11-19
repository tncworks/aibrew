import { getApps, initializeApp, AppOptions } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { loadConfig } from '../config/index.js';

let firestoreInstance: Firestore | null = null;

function initFirestore() {
  const cfg = loadConfig();
  if (!getApps().length) {
    const options: AppOptions = {
      projectId: cfg.firestore.projectId,
    };

    initializeApp(options);
  }

  const firestore = getFirestore();

  if (cfg.firestore.emulatorHost) {
    firestore.settings({
      host: cfg.firestore.emulatorHost,
      ssl: false,
    });
  }

  return firestore;
}

export function getDb(): Firestore {
  if (!firestoreInstance) {
    firestoreInstance = initFirestore();
  }
  return firestoreInstance;
}
