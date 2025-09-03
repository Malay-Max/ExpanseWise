import * as admin from 'firebase-admin';
import type {Auth} from 'firebase-admin/auth';
import type {Firestore} from 'firebase-admin/firestore';

const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

const initializeAdminApp = (): {
  adminDb: Firestore;
  adminAuth: Auth;
} => {
  if (admin.apps.length > 0) {
    return {
      adminDb: admin.firestore(),
      adminAuth: admin.auth(),
    };
  }

  if (!privateKey || !clientEmail) {
    throw new Error('Firebase Admin SDK environment variables are not set.');
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error);
    throw new Error('Failed to initialize Firebase Admin SDK: ' + error.message);
  }

  return {
    adminDb: admin.firestore(),
    adminAuth: admin.auth(),
  };
};

// Initialize and export admin services
const {adminDb, adminAuth} = initializeAdminApp();

export {adminDb, adminAuth};
