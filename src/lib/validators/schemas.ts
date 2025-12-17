import { z } from "zod";

export const legalEntitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  entityType: z.string().min(1, "Entity type is required"),
});

export const agreementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  fullText: z.string().min(10, "Agreement text must be at least 10 characters"),
  entityId: z.string().min(1, "Legal entity is required"),
});

export const clauseSchema = z.object({
  clauseNumber: z.string().optional(),
  title: z.string().optional(),
  content: z.string().min(1, "Clause content is required"),
  startOffset: z.number().int().nonnegative().optional(),
  endOffset: z.number().int().nonnegative().optional(),
});

export const policyRuleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  description: z.string().min(1, "Description is required"),
  ruleText: z.string().min(1, "Rule text is required"),
  category: z.string().min(1, "Category is required"),
  severity: z.enum(["low", "medium", "high"]).default("medium"),
  isActive: z.boolean().default(true),
});

export const riskAssessmentSchema = z.object({
  clauseId: z.string().min(1),
  ruleId: z.string().min(1),
  riskLevel: z.enum(["green", "yellow", "red"]),
  explanation: z.string().min(1),
  confidence: z.number().min(0).max(1).optional(),
});

export const fullTextSchema = z.object({
  assessmentId: z.string().min(1),
  evidenceText: z.string().min(1),
  startOffset: z.number().int().nonnegative(),
  endOffset: z.number().int().nonnegative(),
  contextBefore: z.string().optional(),
  contextAfter: z.string().optional(),
});

export type LegalEntityInput = z.infer<typeof legalEntitySchema>;
export type AgreementInput = z.infer<typeof agreementSchema>;
export type ClauseInput = z.infer<typeof clauseSchema>;
export type PolicyRuleInput = z.infer<typeof policyRuleSchema>;
export type RiskAssessmentInput = z.infer<typeof riskAssessmentSchema>;
export type FullTextInput = z.infer<typeof fullTextSchema>;

