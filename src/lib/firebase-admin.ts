'use server';
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

    try {
        // This is the recommended way for server environments like App Hosting
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } catch (error: any) {
        console.error('Firebase admin initialization error', error);
        throw new Error('Failed to initialize Firebase Admin SDK. Ensure your service account credentials are set up correctly in your environment.');
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
