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
        // Recommended for environments with Application Default Credentials (e.g., App Hosting)
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } catch (error: any) {
        console.warn('Application Default Credentials failed. Falling back to service account key.', error.message);
        
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (!serviceAccountKey) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Required for fallback initialization.');
        }
        
        try {
            const parsedKey = JSON.parse(serviceAccountKey);
            admin.initializeApp({
                credential: admin.credential.cert(parsedKey),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            });
        } catch (jsonError: any)
{
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON.', jsonError);
            throw new Error('Failed to initialize Firebase Admin SDK. The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not a valid JSON object.');
        }
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
