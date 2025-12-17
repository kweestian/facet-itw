import { db } from "@/lib/db";
import { AgreementList } from "@/components/agreement/agreement-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AgreementsPage() {
  const agreements = await db.agreement.findMany({
    include: {
      entity: true,
      clauses: {
        include: {
          assessments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agreements</h1>
            <p className="text-muted-foreground">
              Manage and analyze your agreements
            </p>
          </div>
          <Button asChild>
            <Link href="/agreements/new">New Agreement</Link>
          </Button>
        </div>

        <AgreementList agreements={agreements} />
      </div>
    </div>
  );
}

