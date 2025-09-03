import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore;
let adminAuth: Auth;

if (!admin.apps.length) {
  try {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccountKey)),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error);
    throw new Error('Failed to initialize Firebase Admin SDK: ' + error.message);
  }
}

adminDb = admin.firestore();
adminAuth = admin.auth();

export { adminDb, adminAuth };
