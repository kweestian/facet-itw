"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AnalysisStreamProps {
  progress: {
    clauseId: string;
    clauseNumber?: string;
    totalClauses: number;
    currentClause: number;
    status: "extracting" | "analyzing" | "complete";
  };
}

export function AnalysisStream({ progress }: AnalysisStreamProps) {
  const percentage = progress.totalClauses > 0
    ? Math.round((progress.currentClause / progress.totalClauses) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Progress</CardTitle>
        <CardDescription>
          {progress.status === "extracting" && "Extracting clauses from agreement..."}
          {progress.status === "analyzing" && `Analyzing clause ${progress.currentClause} of ${progress.totalClauses}...`}
          {progress.status === "complete" && "Analysis complete!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
          {progress.status === "analyzing" && progress.clauseNumber && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Clause {progress.clauseNumber}</Badge>
              <span className="text-sm text-muted-foreground">
                Checking against policy rules...
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

