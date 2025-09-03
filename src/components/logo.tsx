import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="bg-primary text-primary-foreground p-2 rounded-lg">
        <Wallet className="w-5 h-5" />
      </div>
      <span className="text-xl font-bold font-headline">ExpenseWise</span>
    </div>
  );
}
