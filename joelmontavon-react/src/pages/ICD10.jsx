import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ExternalLink } from "lucide-react";

export function ICD10() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>ICD-10 Explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Searchable ICD-10 code database. Browse and search through the International
            Classification of Diseases, 10th Revision codes to find diagnosis codes,
            descriptions, and clinical information.
          </p>
          <Button asChild>
            <a
              href="https://joelmontavon.github.io/icd-10-explorer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open ICD-10 Explorer
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border overflow-hidden">
        <iframe
          src="https://joelmontavon.github.io/icd-10-explorer"
          title="ICD-10 Explorer"
          className="w-full h-[800px] border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
