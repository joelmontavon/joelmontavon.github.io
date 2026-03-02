import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { ExternalLink } from "lucide-react";

export function FundOfInterop() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Fundamentals of Interoperability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Introduction to healthcare interoperability and FHIR standards. Learn the fundamentals
            of health data exchange, HL7 FHIR resources, APIs, and how modern healthcare systems
            communicate securely and efficiently.
          </p>
          <Button asChild>
            <a
              href="https://joelmontavon.github.io/fund-of-interop/fund-of-interop.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open Interoperability Tutorial
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border overflow-hidden">
        <iframe
          src="https://joelmontavon.github.io/fund-of-interop/fund-of-interop.html"
          title="Fundamentals of Interoperability"
          className="w-full h-[800px] border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
