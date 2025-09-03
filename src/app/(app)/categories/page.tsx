import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Shapes } from "lucide-react";

export default function CategoriesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Categories</CardTitle>
        <CardDescription>Manage your expense categories.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64 border-2 border-dashed rounded-lg">
            <Shapes className="w-16 h-16 mb-4" />
            <p className="text-lg font-semibold">Coming Soon</p>
            <p>This section is under construction.</p>
        </div>
      </CardContent>
    </Card>
  );
}
