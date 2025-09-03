import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const expenseSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  category: z.string(),
  paymentMethod: z.string(),
  description: z.string().optional(),
  date: z.string().datetime(),
});

export async function POST(request: Request) {
  // 1. Authenticate the request
  const authHeader = request.headers.get('Authorization');
  const expectedToken = `Bearer ${process.env.N8N_API_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Validate the request body
  const body = await request.json();
  const validation = expenseSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request body', details: validation.error.flatten() }, { status: 400 });
  }

  // 3. Prepare data for Firestore
  const { date, ...restOfData } = validation.data;
  const userId = process.env.N8N_USER_ID;

  if (!userId) {
     return NextResponse.json({ error: 'N8N_USER_ID is not configured on the server.' }, { status: 500 });
  }

  const expenseData = {
    ...restOfData,
    date: new Date(date), // Convert ISO string to Date object
    userId,
    createdAt: FieldValue.serverTimestamp(),
  };

  // 4. Save to Firestore
  try {
    const expenseRef = await adminDb.collection('expenses').add(expenseData);
    return NextResponse.json({ id: expenseRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error adding document to Firestore:', error);
    return NextResponse.json({ error: 'Failed to save expense' }, { status: 500 });
  }
}
