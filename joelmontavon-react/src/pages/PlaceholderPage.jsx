import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Construction } from "lucide-react";

export function PlaceholderPage({ title, description }) {
  return (
    <div className="container py-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-yellow-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {description || "This page is under construction. Check back soon!"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
