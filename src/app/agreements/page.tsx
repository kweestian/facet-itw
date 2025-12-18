import { db } from "@/lib/db";
import { agreements } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RiskBadge } from "@/components/analysis/risk-badge";

export default async function AgreementsPage() {
  const agreementsList = db
    .select()
    .from(agreements)
    .orderBy(desc(agreements.createdAt))
    .all();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Agreements</h1>
            <p className="text-muted-foreground">View all analyzed NDAs</p>
          </div>
          <Button asChild>
            <Link href="/">New Analysis</Link>
          </Button>
        </div>

        {agreementsList.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No agreements yet.{" "}
              <Link href="/" className="text-primary underline">
                Create your first analysis
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {agreementsList.map((agreement) => (
              <Card key={agreement.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        <Link
                          href={`/agreements/${agreement.id}`}
                          className="hover:underline"
                        >
                          {agreement.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        {agreement.analyzedAt
                          ? `Analyzed ${new Date(
                              agreement.analyzedAt
                            ).toLocaleDateString()}`
                          : "Not analyzed"}
                      </CardDescription>
                    </div>
                    {agreement.overallRiskScore && (
                      <RiskBadge
                        riskLevel={
                          agreement.overallRiskScore.toLowerCase() as
                            | "green"
                            | "yellow"
                            | "red"
                        }
                      />
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
