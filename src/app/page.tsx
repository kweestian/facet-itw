import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Facet</h1>
          <p className="text-muted-foreground">
            AI-powered contract risk assessment and compliance analysis
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Agreements</CardTitle>
              <CardDescription>Manage and analyze agreements</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/agreements">View Agreements</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Policy Rules</CardTitle>
              <CardDescription>Manage compliance rules</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/rules">View Rules</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Get started with Facet in 3 steps</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Create a legal entity (or use the default workspace entity)</li>
              <li>Upload or paste an agreement text</li>
              <li>Run analysis to get traffic-light risk assessment</li>
            </ol>
            <div className="mt-4">
              <Button asChild>
                <Link href="/agreements/new">Create Your First Agreement</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

