import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { agreements, riskAssessments, policyRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { RiskBadge } from "@/components/analysis/risk-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuditTrailView } from "@/components/audit/audit-trail-view";

export default async function AgreementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const agreement = db
    .select()
    .from(agreements)
    .where(eq(agreements.id, id))
    .limit(1)
    .get();

  if (!agreement) {
    notFound();
  }

  // Get assessments with rules
  const assessments = db
    .select({
      assessment: riskAssessments,
      rule: policyRules,
    })
    .from(riskAssessments)
    .innerJoin(policyRules, eq(riskAssessments.ruleId, policyRules.id))
    .where(eq(riskAssessments.agreementId, id))
    .all();

  const assessmentsWithRules = assessments.map((a) => ({
    ...a.assessment,
    rule: a.rule,
  }));

  // Group by flag color
  const redAssessments = assessmentsWithRules.filter(
    (a) => a.flagColor === "RED"
  );
  const yellowAssessments = assessmentsWithRules.filter(
    (a) => a.flagColor === "YELLOW"
  );
  const greenAssessments = assessmentsWithRules.filter(
    (a) => a.flagColor === "GREEN"
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{agreement.title}</h1>
            <p className="text-muted-foreground">
              {agreement.analyzedAt ? "Analyzed" : "Not analyzed"}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>

        {agreement.overallRiskScore && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overall Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskBadge
                riskLevel={
                  agreement.overallRiskScore.toLowerCase() as
                    | "GREEN"
                    | "YELLOW"
                    | "RED"
                }
              />
            </CardContent>
          </Card>
        )}

        {assessmentsWithRules.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No analysis available. Please run analysis first.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {redAssessments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-red-600">
                  🔴 Show-Stoppers ({redAssessments.length})
                </h2>
                <div className="space-y-4">
                  {redAssessments.map((assessment) => (
                    <Card key={assessment.id} className="border-red-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {assessment.rule.name}
                          </CardTitle>
                          <Badge variant="destructive">RED</Badge>
                        </div>
                        <CardDescription>
                          {assessment.rule.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Assessment:
                          </p>
                          <p className="text-sm">{assessment.explanation}</p>
                        </div>
                        {assessment.evidenceText && (
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Evidence:
                            </p>
                            <p className="text-sm font-mono bg-muted p-2 rounded">
                              {assessment.evidenceText}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Acceptance Criteria:
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {assessment.rule.acceptanceCriteria}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {yellowAssessments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-yellow-600">
                  🟡 Review Recommended ({yellowAssessments.length})
                </h2>
                <div className="space-y-4">
                  {yellowAssessments.map((assessment) => (
                    <Card key={assessment.id} className="border-yellow-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {assessment.rule.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="border-yellow-500 text-yellow-700"
                          >
                            YELLOW
                          </Badge>
                        </div>
                        <CardDescription>
                          {assessment.rule.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Assessment:
                          </p>
                          <p className="text-sm">{assessment.explanation}</p>
                        </div>
                        {assessment.evidenceText && (
                          <div>
                            <p className="text-sm font-medium mb-1">
                              Evidence:
                            </p>
                            <p className="text-sm font-mono bg-muted p-2 rounded">
                              {assessment.evidenceText}
                            </p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Acceptance Criteria:
                          </p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {assessment.rule.acceptanceCriteria}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {greenAssessments.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4 text-green-600">
                  🟢 Compliant ({greenAssessments.length})
                </h2>
                <div className="space-y-4">
                  {greenAssessments.map((assessment) => (
                    <Card key={assessment.id} className="border-green-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">
                            {assessment.rule.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-700"
                          >
                            GREEN
                          </Badge>
                        </div>
                        <CardDescription>
                          {assessment.rule.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{assessment.explanation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Trail Section */}
        {agreement.analyzedAt && (
          <div className="mt-8">
            <AuditTrailView agreementId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
