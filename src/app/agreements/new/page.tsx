import { db } from "@/lib/db";
import { AgreementForm } from "@/components/agreement/agreement-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function NewAgreementPage() {
  const entities = await db.legalEntity.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">New Agreement</h1>
            <p className="text-muted-foreground">
              Upload or paste agreement text for analysis
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/agreements">Back to Agreements</Link>
          </Button>
        </div>

        <AgreementForm entities={entities} />
      </div>
    </div>
  );
}

