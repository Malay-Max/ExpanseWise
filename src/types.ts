import type { Timestamp } from 'firebase/firestore';

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  paymentMethod: string;
  description: string;
  date: Timestamp;
  createdAt: Timestamp;
  userId: string;
}
