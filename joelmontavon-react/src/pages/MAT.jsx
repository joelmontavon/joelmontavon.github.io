import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ExternalLink } from "lucide-react";

export function MAT() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Measure Authoring Tool (MAT)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Guide to using the CMS Measure Authoring Tool with a CQL code runner.
            Learn how to author, test, and validate clinical quality measures using
            the standardized CQL (Clinical Quality Language) framework.
          </p>
          <Button asChild>
            <a
              href="https://joelmontavon.github.io/cql-camp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open MAT Tutorial
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border overflow-hidden">
        <iframe
          src="https://joelmontavon.github.io/cql-camp"
          title="Measure Authoring Tool Tutorial"
          className="w-full h-[800px] border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
