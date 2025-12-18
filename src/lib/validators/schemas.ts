import { z } from "zod";

// Enums matching schema
export const RiskScore = z.enum(["GREEN", "YELLOW", "RED"]);
export const RuleSeverity = z.enum(["SHOW_STOPPER", "NEGOTIABLE", "COMPLIANT"]);
export const FlagColor = z.enum(["GREEN", "YELLOW", "RED"]);

// Agreement Schema (simplified)
export const agreementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  rawText: z.string().min(10, "Agreement text must be at least 10 characters"),
});

// PolicyRule Schema
export const policyRuleSchema = z.object({
  ruleId: z.string().min(1, "Rule ID is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  acceptanceCriteria: z.string().min(1, "Acceptance criteria is required"),
  severity: RuleSeverity,
  isActive: z.boolean().optional().default(true),
});

// RiskAssessment Schema
export const riskAssessmentSchema = z.object({
  agreementId: z.string().min(1),
  ruleId: z.string().min(1),
  flagColor: FlagColor,
  explanation: z.string().min(1, "Explanation is required"),
  evidenceText: z.string().optional().nullable(),
});

// AI Response Schemas - for validating AI analysis output
export const policyCheckResultSchema = z.object({
  ruleId: z.string().min(1, "Rule ID is required"),
  flagColor: FlagColor,
  explanation: z.string().min(1, "Explanation is required"),
  evidenceText: z
    .string()
    .optional()
    .describe("Exact text from the NDA that supports the assessment"),
  lineNumber: z
    .number()
    .optional()
    .describe(
      "Line number in the NDA where the issue was found (if applicable)"
    ),
});

export const policyChecklistAnalysisSchema = z.object({
  results: z
    .array(policyCheckResultSchema)
    .min(1, "At least one result is required"),
  overallRiskScore: FlagColor,
});
