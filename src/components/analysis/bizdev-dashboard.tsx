import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "./risk-badge";

interface BizDevDashboardProps {
  summary: {
    totalClauses: number;
    green: number;
    yellow: number;
    red: number;
  };
  showStoppers: Array<{
    clauseId: string;
    clauseNumber?: string | null;
    title?: string | null;
    riskLevel: string;
    ruleName: string;
  }>;
}

export function BizDevDashboard({ summary, showStoppers }: BizDevDashboardProps) {
  const greenPercent = summary.totalClauses > 0 
    ? Math.round((summary.green / summary.totalClauses) * 100) 
    : 0;
  const yellowPercent = summary.totalClauses > 0 
    ? Math.round((summary.yellow / summary.totalClauses) * 100) 
    : 0;
  const redPercent = summary.totalClauses > 0 
    ? Math.round((summary.red / summary.totalClauses) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Traffic Light Summary</CardTitle>
          <CardDescription>Quick overview of agreement risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {summary.green}
              </div>
              <RiskBadge riskLevel="green" />
              <div className="text-sm text-muted-foreground mt-1">{greenPercent}%</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {summary.yellow}
              </div>
              <RiskBadge riskLevel="yellow" />
              <div className="text-sm text-muted-foreground mt-1">{yellowPercent}%</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">
                {summary.red}
              </div>
              <RiskBadge riskLevel="red" />
              <div className="text-sm text-muted-foreground mt-1">{redPercent}%</div>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-muted-foreground">
              Total Clauses Analyzed: <span className="font-semibold text-foreground">{summary.totalClauses}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {showStoppers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Show-Stoppers</CardTitle>
            <CardDescription>High-risk clauses requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {showStoppers.map((stopper) => (
                <div
                  key={stopper.clauseId}
                  className="flex items-center justify-between p-3 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
                >
                  <div>
                    <div className="font-medium">
                      Clause {stopper.clauseNumber || "N/A"}
                      {stopper.title && `: ${stopper.title}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Rule: {stopper.ruleName}
                    </div>
                  </div>
                  <RiskBadge riskLevel="red" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showStoppers.length === 0 && summary.red === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              ✅ No show-stoppers found. Agreement appears compliant.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

