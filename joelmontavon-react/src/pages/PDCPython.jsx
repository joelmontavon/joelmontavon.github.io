import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { JupyterNotebook } from "@/components/common";
import { ExternalLink } from "lucide-react";

export function PDCPython() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>PDC with Python</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Proportion of Days Covered (PDC) calculation using Python. Learn how to implement
            the PDC adherence measure using Python with pandas, NumPy, and practical
            code examples for healthcare analytics.
          </p>
          <Button asChild>
            <a
              href="https://joelmontavon.github.io/pdc-python"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              Open Full Tutorial
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="mt-8">
        <Card>
          <JupyterNotebook
            notebookUrl="/notebooks/test.ipynb"
            title="Interactive Notebook Preview"
          />
        </Card>
      </div>

      <div className="mt-8 rounded-lg border overflow-hidden">
        <iframe
          src="https://joelmontavon.github.io/pdc-python"
          title="PDC with Python Tutorial"
          className="w-full h-[800px] border-0"
          loading="lazy"
        />
      </div>
    </div>
  );
}
