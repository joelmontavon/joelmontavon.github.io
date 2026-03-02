import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ExternalLink } from "lucide-react";

export function CQLCamp() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>CQL Runner</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Clinical Quality Language (CQL) code runner and tester. Write, test, and validate
            CQL expressions and queries in an interactive environment. Perfect for learning
            CQL syntax and developing clinical decision support logic.
          </p>
          <Button asChild>
            <a
              href="https://joelmontavon.github.io/cql-camp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open CQL Runner
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border overflow-hidden">
        <iframe
          src="https://joelmontavon.github.io/cql-camp"
          title="CQL Runner"
          className="w-full h-[800px] border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
