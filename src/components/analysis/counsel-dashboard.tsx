import * as React from "react";
import { EvidenceChain } from "./evidence-chain";

interface CounselDashboardProps {
  clauses: Array<{
    id: string;
    clauseNumber?: string | null;
    title?: string | null;
    content: string;
    assessments: Array<{
      id: string;
      riskLevel: string;
      explanation: string;
      confidence?: number | null;
      rule: {
        id: string;
        name: string;
        description: string;
        category: string;
      };
      evidence: Array<{
        id: string;
        evidenceText: string;
        startOffset: number;
        endOffset: number;
        contextBefore?: string | null;
        contextAfter?: string | null;
      }>;
    }>;
  }>;
}

export function CounselDashboard({ clauses }: CounselDashboardProps) {
  // Filter to only show clauses with assessments
  const clausesWithAssessments = clauses.filter(
    (clause) => clause.assessments.length > 0
  );

  if (clausesWithAssessments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No risk assessments found. Run analysis to see detailed results.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground">
        Showing {clausesWithAssessments.length} clause{clausesWithAssessments.length !== 1 ? "s" : ""} with risk assessments
      </div>
      {clausesWithAssessments.map((clause) => (
        <EvidenceChain key={clause.id} clause={clause} assessments={clause.assessments} />
      ))}
    </div>
  );
}

