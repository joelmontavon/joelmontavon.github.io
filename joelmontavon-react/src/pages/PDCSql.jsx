import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ExternalLink } from "lucide-react";

export function PDCSql() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>PDC with SQL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Proportion of Days Covered (PDC) calculation using SQL. Learn how to implement
            the PDC adherence measure using SQL queries with practical examples
            optimized for healthcare data warehouses.
          </p>
          <Button asChild>
            <a
              href="https://joelmontavon.github.io/pdc-sql"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open PDC SQL Tutorial
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border overflow-hidden">
        <iframe
          src="https://joelmontavon.github.io/pdc-sql"
          title="PDC with SQL Tutorial"
          className="w-full h-[800px] border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
