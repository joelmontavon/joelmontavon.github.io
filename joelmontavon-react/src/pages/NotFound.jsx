import { Link } from "react-router-dom";
import { Button } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="container py-24 text-center">
      <h1 className="text-9xl font-bold text-muted-foreground/20">404</h1>
      <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
      <p className="text-muted-foreground mt-2 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex justify-center gap-4">
        <Button asChild>
          <Link to="/">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
