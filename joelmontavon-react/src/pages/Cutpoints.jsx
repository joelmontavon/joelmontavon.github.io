import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ExternalLink } from "lucide-react";

export function Cutpoints() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Star Ratings Cutpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Star ratings cutpoint thresholds and methodology. Understand how CMS determines
            the threshold values that define each star rating level for quality measures.
          </p>
          <Button asChild>
            <a
              href="https://joelmontavon.github.io/star-ratings-cutpoints"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open Cutpoints Tutorial
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border overflow-hidden">
        <iframe
          src="https://joelmontavon.github.io/star-ratings-cutpoints"
          title="Star Ratings Cutpoints Tutorial"
          className="w-full h-[800px] border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
