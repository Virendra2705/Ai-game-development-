import { IDatabaseAdapter } from './IDatabaseAdapter';
import { LocalRepository } from './LocalRepository';
import { FirestoreRepository } from './FirestoreRepository';

let repositoryInstance: IDatabaseAdapter | null = null;

export function getDatabaseAdapter(): IDatabaseAdapter {
  if (!repositoryInstance) {
    // Check if Firebase credentials exist in environment
    const hasFirebase =
      typeof process !== 'undefined' &&
      Boolean(process.env?.FIREBASE_CONFIG || process.env?.NEXT_PUBLIC_FIREBASE_API_KEY);

    if (hasFirebase) {
      repositoryInstance = new FirestoreRepository();
    } else {
      repositoryInstance = new LocalRepository();
    }
  }
  return repositoryInstance;
}

export * from './IDatabaseAdapter';
export * from './LocalRepository';
export * from './FirestoreRepository';
