// Type exports matching Prisma enums
export type LegalEntityRole = "DISCLOSER" | "RECIPIENT" | "MUTUAL";
export type AgreementType = "MUTUAL" | "ONE_WAY";
export type RiskScore = "GREEN" | "YELLOW" | "RED";
export type ClauseCategory =
  | "CONFIDENTIALITY"
  | "TERM"
  | "INDEMNITY"
  | "REMEDIES"
  | "GOVERNING_LAW"
  | "NON_SOLICIT"
  | "MUTUALITY"
  | "EXCEPTIONS";
export type RuleSeverity = "SHOW_STOPPER" | "NEGOTIABLE" | "COMPLIANT";
export type AssessmentStatus = "PASS" | "FAIL";
export type FlagColor = "GREEN" | "YELLOW" | "RED";

// Legacy type for backward compatibility (maps to FlagColor)
export type RiskLevel = FlagColor;

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
    flagColor: FlagColor;
    status: AssessmentStatus;
    explanation: string;
    evidence: Array<{
      text: string;
      startOffset: number;
      endOffset: number;
    }>;
  }>;
}
