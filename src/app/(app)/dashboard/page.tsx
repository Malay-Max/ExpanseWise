import { Suspense } from 'react';
import StatsCards, { StatsCardsSkeleton } from '@/components/dashboard/stats-cards';
import RecentExpenses, { RecentExpensesSkeleton } from '@/components/dashboard/recent-expenses';
import { CategoryChart, PaymentMethodChart, ChartsSkeleton } from '@/components/dashboard/charts';
import { getExpensesSummary, getExpensesForPeriod, getRecentExpenses, getCategorySpending, getPaymentMethodSpending } from '@/lib/firestore-helpers';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

async function getUserId() {
  const sessionCookie = cookies().get('firebase-session-token')?.value;
  if (!sessionCookie) return null;
  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedToken.uid;
  } catch (error) {
    return null;
  }
}

export default async function DashboardPage() {
  const userId = await getUserId();

  if (!userId) {
    // This should theoretically not be reached due to middleware, but as a safeguard:
    return <div className="p-4">Please log in to view your dashboard.</div>;
  }

  return (
    <>
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCardsLoader userId={userId} />
      </Suspense>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Suspense fallback={<RecentExpensesSkeleton />}>
            <RecentExpensesLoader userId={userId} />
          </Suspense>
        </div>
        <div className="grid gap-4 md:gap-8">
            <Suspense fallback={<ChartsSkeleton title="Spending by Category" />}>
              <CategoryChartLoader userId={userId} />
            </Suspense>
            <Suspense fallback={<ChartsSkeleton title="Spending by Payment Method" />}>
              <PaymentMethodChartLoader userId={userId} />
            </Suspense>
        </div>
      </div>
    </>
  );
}

async function StatsCardsLoader({ userId }: { userId: string }) {
  const summary = await getExpensesSummary(userId);
  return <StatsCards summary={summary} />;
}

async function RecentExpensesLoader({ userId }: { userId: string }) {
  const recentExpenses = await getRecentExpenses(userId, 5);
  return <RecentExpenses expenses={recentExpenses} />;
}

async function CategoryChartLoader({ userId }: { userId: string }) {
  const categorySpending = await getCategorySpending(userId);
  return <CategoryChart data={categorySpending} />;
}

async function PaymentMethodChartLoader({ userId }: { userId:string}) {
  const paymentMethodSpending = await getPaymentMethodSpending(userId);
  return <PaymentMethodChart data={paymentMethodSpending} />;
}
