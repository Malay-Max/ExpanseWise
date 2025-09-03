
import * as admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

let adminDb: Firestore;
let adminAuth: Auth;

function initializeAdminApp() {
    if (admin.apps.length > 0) {
        return {
            adminDb: admin.firestore(),
            adminAuth: admin.auth(),
        };
    }

    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!serviceAccountKey) {
        throw new Error('Firebase Admin SDK initialization failed: The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }
    
    try {
        const serviceAccount = JSON.parse(serviceAccountKey);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } catch (error: any) {
        console.error('Firebase admin initialization error: Failed to parse service account key.', error);
        throw new Error('Failed to initialize Firebase Admin SDK. The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not a valid JSON object.');
    }

    return {
        adminDb: admin.firestore(),
        adminAuth: admin.auth(),
    };
}

const initialized = initializeAdminApp();
adminDb = initialized.adminDb;
adminAuth = initialized.adminAuth;


export { adminDb, adminAuth };
