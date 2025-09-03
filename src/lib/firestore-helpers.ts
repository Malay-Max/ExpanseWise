import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';
import type { Expense } from '@/types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Helper to fetch expenses for a given user and optional date range
async function getExpensesForPeriod(userId: string, startDate?: Date, endDate?: Date): Promise<Expense[]> {
  const expensesCol = collection(db, 'expenses');
  let q = query(expensesCol, where('userId', '==', userId));

  if (startDate) {
    q = query(q, where('date', '>=', startDate));
  }
  if (endDate) {
    q = query(q, where('date', '<=', endDate));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
}

// 1. For Summary Cards
export async function getExpensesSummary(userId: string) {
  const now = new Date();

  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  const todayPromise = getExpensesForPeriod(userId, todayStart);
  const weekPromise = getExpensesForPeriod(userId, weekStart);
  const monthPromise = getExpensesForPeriod(userId, monthStart);

  const [todayExpenses, weekExpenses, monthExpenses] = await Promise.all([todayPromise, weekPromise, monthPromise]);

  const totalToday = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalThisWeek = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalThisMonth = monthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return { totalToday, totalThisWeek, totalThisMonth };
}

// 2. For Spending by Category Chart
export async function getCategorySpending(userId: string) {
  const expenses = await getExpensesForPeriod(userId, startOfMonth(new Date()), endOfMonth(new Date()));
  const categoryMap = new Map<string, number>();

  expenses.forEach(expense => {
    const currentTotal = categoryMap.get(expense.category) || 0;
    categoryMap.set(expense.category, currentTotal + expense.amount);
  });

  return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
}

// 3. For Spending by Payment Method Chart
export async function getPaymentMethodSpending(userId: string) {
    const expenses = await getExpensesForPeriod(userId, startOfMonth(new Date()), endOfMonth(new Date()));
    const paymentMethodMap = new Map<string, number>();
  
    expenses.forEach(expense => {
      const currentTotal = paymentMethodMap.get(expense.paymentMethod) || 0;
      paymentMethodMap.set(expense.paymentMethod, currentTotal + expense.amount);
    });
  
    return Array.from(paymentMethodMap.entries()).map(([name, value]) => ({ name, value }));
}

// 4. For Recent Transactions Table
export async function getRecentExpenses(userId: string, count: number): Promise<Expense[]> {
  const expensesCol = collection(db, 'expenses');
  const q = query(expensesCol, where('userId', '==', userId), orderBy('date', 'desc'), limit(count));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
}

// For All Expenses page
export async function getAllExpenses(userId: string, filters: { startDate?: Date, endDate?: Date, category?: string, paymentMethod?: string }): Promise<Expense[]> {
  const expensesCol = collection(db, 'expenses');
  let q = query(expensesCol, where('userId', '==', userId), orderBy('date', 'desc'));

  if (filters.startDate) {
    q = query(q, where('date', '>=', Timestamp.fromDate(filters.startDate)));
  }
  if (filters.endDate) {
    q = query(q, where('date', '<=', Timestamp.fromDate(filters.endDate)));
  }
  if (filters.category) {
    q = query(q, where('category', '==', filters.category));
  }
  if (filters.paymentMethod) {
    q = query(q, where('paymentMethod', '==', filters.paymentMethod));
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
}
