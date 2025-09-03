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
        // Recommended for server environments like App Hosting
        admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    } catch (error: any) {
        // Fallback for local development or environments where ADC is not set up
        const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        if (serviceAccountKey) {
            try {
                const serviceAccount = JSON.parse(serviceAccountKey);
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                });
            } catch (jsonError: any) {
                console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON.', jsonError);
                throw new Error('Failed to initialize Firebase Admin SDK. The FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not a valid JSON object.');
            }
        } else {
             throw new Error('Failed to initialize Firebase Admin SDK. Service account credentials are not available. Please set either Application Default Credentials or the FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
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
