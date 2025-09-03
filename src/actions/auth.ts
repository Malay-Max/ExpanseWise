
'use server';

import { adminAuth } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signup(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password } = validatedFields.data;

  try {
    console.log('[Action] Attempting to create user with Admin SDK for:', email);
    await adminAuth.createUser({
      email,
      password,
    });
    console.log('[Action] Successfully created user:', email);
    return { success: 'Account created! Please log in.' };
  } catch (error: any) {
    console.error("Signup Error:", error);
    if (error.code === 'auth/email-already-exists') {
      return { error: 'An account with this email already exists.' };
    }
     return { error: 'An unexpected error occurred during signup. Please try again.' };
  }
}

export async function createSession(idToken: string) {
    try {
        console.log('[Action] Verifying ID token and creating session cookie...');
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const decodedToken = await adminAuth.verifyIdToken(idToken, true);
        
        console.log('[Action] ID token verified for UID:', decodedToken.uid);

        // Ensure the token is not expired, just in case.
        if (new Date().getTime() / 1000 > decodedToken.exp) {
            console.error('[Action] Attempted to use an expired token.');
            return { error: 'Token expired' };
        }

        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        cookies().set('firebase-session-token', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        
        console.log('[Action] Session cookie created and set.');
        return { success: true };
    } catch (error) {
        console.error('Session Creation Error:', error);
        return { error: 'Failed to create session' };
    }
}


export async function clearSession() {
  try {
    console.log('[Action] Clearing session cookie.');
    cookies().delete('firebase-session-token');
    return { success: 'Logged out successfully' };
  } catch (error: any) {
    console.error("Logout Error:", error);
    return { error: error.message };
  }
}
