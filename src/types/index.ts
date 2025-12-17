export type RiskLevel = "green" | "yellow" | "red";

export interface AnalysisProgress {
  clauseId: string;
  clauseNumber?: string;
  totalClauses: number;
  currentClause: number;
  status: "extracting" | "analyzing" | "complete";
}

export interface AnalysisResult {
  clauseId: string;
  assessments: Array<{
    ruleId: string;
    ruleName: string;
    riskLevel: RiskLevel;
    explanation: string;
    evidence: Array<{
      text: string;
      startOffset: number;
      endOffset: number;
    }>;
  }>;
}

