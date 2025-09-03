
'use server';

import { adminAuth } from '@/lib/firebase-admin';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }
  
  const { email, password } = validatedFields.data;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set('firebase-session-token', sessionCookie, { maxAge: expiresIn, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return { success: 'Logged in successfully!' };
  } catch (error: any) {
    // Provide a more generic error to avoid leaking implementation details
    if (error.code && (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
        return { error: 'Invalid email or password.' };
    }
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

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
    if (error.code === 'auth/email-already-exists') {
      return { error: 'An account with this email already exists.' };
    }
     return { error: 'An unexpected error occurred during signup. Please try again.' };
  }
}


export async function logout() {
  try {
    cookies().delete('firebase-session-token');
    await firebaseSignOut(auth);
    return { success: 'Logged out successfully' };
  } catch (error: any) {
    return { error: error.message };
  }
}

