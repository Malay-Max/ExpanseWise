import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export default function PaymentMethodsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Payment Methods</CardTitle>
        <CardDescription>Manage your payment methods.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
            <CreditCard className="w-16 h-16 mb-4" />
            <p className="text-lg font-semibold">Coming Soon</p>
            <p>This section is under construction.</p>
        </div>
      </CardContent>
    </Card>
  );
}
