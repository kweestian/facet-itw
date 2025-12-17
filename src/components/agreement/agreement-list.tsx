"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Agreement {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  analyzedAt?: string | null;
  entity: {
    name: string;
  };
  clauses: Array<{
    assessments: Array<{
      riskLevel: string;
    }>;
  }>;
}

interface AgreementListProps {
  agreements: Agreement[];
}

export function AgreementList({ agreements }: AgreementListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "analyzed":
        return <Badge variant="default">Analyzed</Badge>;
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRiskSummary = (agreement: Agreement) => {
    const allAssessments = agreement.clauses.flatMap((c) => c.assessments);
    const red = allAssessments.filter((a) => a.riskLevel === "red").length;
    const yellow = allAssessments.filter((a) => a.riskLevel === "yellow").length;
    const green = allAssessments.filter((a) => a.riskLevel === "green").length;

    if (red > 0) return { count: red, level: "red" as const, label: "🔴 High Risk" };
    if (yellow > 0) return { count: yellow, level: "yellow" as const, label: "🟡 Medium Risk" };
    if (green > 0) return { count: green, level: "green" as const, label: "🟢 Low Risk" };
    return null;
  };

  if (agreements.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground py-8">
            No agreements yet. Create your first agreement to get started.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {agreements.map((agreement) => {
        const riskSummary = getRiskSummary(agreement);
        return (
          <Card key={agreement.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle>
                    <Link
                      href={`/agreements/${agreement.id}`}
                      className="hover:underline"
                    >
                      {agreement.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {agreement.entity.name} • Created{" "}
                    {new Date(agreement.createdAt).toLocaleDateString()}
                    {agreement.analyzedAt &&
                      ` • Analyzed ${new Date(agreement.analyzedAt).toLocaleDateString()}`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(agreement.status)}
                  {riskSummary && (
                    <Badge
                      variant={
                        riskSummary.level === "red"
                          ? "destructive"
                          : riskSummary.level === "yellow"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {riskSummary.label}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/agreements/${agreement.id}`}>View Details</Link>
                </Button>
                {agreement.status === "draft" && (
                  <Button asChild variant="default" size="sm">
                    <Link href={`/agreements/${agreement.id}`}>Analyze</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

