'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getAllExpenses } from '@/lib/firestore-helpers';
import type { Expense } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DateRangePicker } from '@/components/date-range-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export default function ExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [category, setCategory] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  useEffect(() => {
    if (user) {
      setLoading(true);
      getAllExpenses(user.uid, {
        startDate: dateRange?.from,
        endDate: dateRange?.to,
        category: category || undefined,
        paymentMethod: paymentMethod || undefined,
      }).then(data => {
        setExpenses(data);
        setLoading(false);
      });
    }
  }, [user, dateRange, category, paymentMethod]);

  const uniqueCategories = useMemo(() => [...new Set(expenses.map(e => e.category))], [expenses]);
  const uniquePaymentMethods = useMemo(() => [...new Set(expenses.map(e => e.paymentMethod))], [expenses]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">All Expenses</CardTitle>
        <CardDescription>View and filter all your transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <DateRangePicker onUpdate={({ range }) => setDateRange(range)} />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Methods</SelectItem>
              {uniquePaymentMethods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-32"/></TableCell>
                    <TableCell><Skeleton className="h-5 w-24"/></TableCell>
                    <TableCell><Skeleton className="h-5 w-20"/></TableCell>
                    <TableCell><Skeleton className="h-5 w-28"/></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto"/></TableCell>
                </TableRow>
              ))
            ) : expenses.length > 0 ? (
              expenses.map(expense => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description || 'N/A'}</TableCell>
                  <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                  <TableCell>{format(expense.date.toDate(), 'PP')}</TableCell>
                  <TableCell>{expense.paymentMethod}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No expenses found for the selected filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
