
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
    await adminAuth.createUser({
      email,
      password,
    });
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
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const decodedToken = await adminAuth.verifyIdToken(idToken, true);
        
        // Ensure the token is not expired, just in case.
        if (new Date().getTime() / 1000 > decodedToken.exp) {
            return { error: 'Token expired' };
        }

        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
        cookies().set('firebase-session-token', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return { success: true };
    } catch (error) {
        console.error('Session Creation Error:', error);
        return { error: 'Failed to create session' };
    }
}


export async function clearSession() {
  try {
    cookies().delete('firebase-session-token');
    return { success: 'Logged out successfully' };
  } catch (error: any) {
    console.error("Logout Error:", error);
    return { error: error.message };
  }
}

