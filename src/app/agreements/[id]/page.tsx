import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { AgreementDetailView } from "@/components/agreement/agreement-detail-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const agreement = await db.agreement.findUnique({
    where: { id },
    include: {
      entity: true,
      clauses: {
        include: {
          assessments: {
            include: {
              rule: true,
              evidence: true,
            },
          },
        },
        orderBy: {
          clauseNumber: "asc",
        },
      },
    },
  });

  if (!agreement) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{agreement.title}</h1>
            <p className="text-muted-foreground">
              {agreement.entity.name} • Status: {agreement.status}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/agreements">Back to Agreements</Link>
          </Button>
        </div>

        <AgreementDetailView agreement={agreement} />
      </div>
    </div>
  );
}

