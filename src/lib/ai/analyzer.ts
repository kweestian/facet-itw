import { generateObject } from "ai";
import type { FlagColor } from "@/types";
import { policyChecklistAnalysisSchema } from "@/lib/validators/schemas";
import type { AuditTrailLogger } from "@/lib/audit/audit-trail";

export interface PolicyCheckResult {
  ruleId: string;
  flagColor: FlagColor;
  explanation: string;
  evidenceText?: string;
  lineNumber?: number;
}

export interface PolicyChecklistAnalysis {
  results: PolicyCheckResult[];
  overallRiskScore: FlagColor;
}

export async function analyzeNDAAgainstPolicyChecklist(
  ndaText: string,
  rules: Array<{
    id: string; // Database UUID
    ruleId: string; // String identifier like "MUTUALITY-001"
    name: string;
    description: string;
    acceptanceCriteria: string;
    severity: "SHOW_STOPPER" | "NEGOTIABLE" | "COMPLIANT";
  }>,
  auditLogger?: AuditTrailLogger
): Promise<PolicyChecklistAnalysis> {
  // Log extraction step
  auditLogger?.log({
    step: "extraction",
    action: "Extracting structured information from NDA",
    input: { ndaLength: ndaText.length, rulesCount: rules.length },
    extractedData: {
      documentType: "NDA",
      textLength: ndaText.length,
      rulesToEvaluate: rules.map((r) => r.ruleId),
    },
    reasoning:
      "Analyzing unstructured NDA text to extract compliance-relevant information",
  });

  const rulesText = rules
    .map(
      (rule, idx) => `${idx + 1}. ${rule.name} (${rule.ruleId})
   Description: ${rule.description}
   Acceptance Criteria: ${rule.acceptanceCriteria}
   Severity: ${rule.severity}`
    )
    .join("\n\n");

  const prompt = `You are a legal compliance analyst reviewing a Non-Disclosure Agreement (NDA) against an internal policy checklist.

NDA Text:
${ndaText}

Policy Checklist:
${rulesText}

Analyze the NDA against each policy rule. For each rule:
1. Determine if it's GREEN (compliant), YELLOW (needs review), or RED (show-stopper)
2. Provide a clear explanation of your assessment
3. Quote the exact text from the NDA that supports your assessment (if applicable)
4. Note the approximate line number where the issue was found (if applicable)

Flag Color Guidelines:
- GREEN: Rule is fully compliant, no issues
- YELLOW: Potential concerns, review recommended, but may be acceptable
- RED: Clear violation or high risk, show-stopper, requires escalation`;

  console.log("Starting AI analysis...");

  // Log rule evaluation step
  auditLogger?.log({
    step: "rule_evaluation",
    action: "Evaluating NDA against policy rules",
    input: {
      rulesEvaluated: rules.map((r) => ({
        ruleId: r.ruleId,
        name: r.name,
        severity: r.severity,
      })),
    },
    reasoning:
      "AI model analyzing NDA text against each policy rule to determine compliance",
  });

  // Use generateObject with explicit mode for Anthropic structured outputs
  const result = await generateObject({
    model: "anthropic/claude-sonnet-4.5",
    schema: policyChecklistAnalysisSchema,
    prompt,
    temperature: 0.2,
  });

  console.log("AI response received");
  console.log(`Analysis complete. ${result.object.results.length} results.`);

  // Log raw AI output
  auditLogger?.log({
    step: "rule_evaluation",
    action: "Received AI analysis response",
    output: {
      resultsCount: result.object.results.length,
      overallRiskScore: result.object.overallRiskScore,
    },
    metadata: {
      model: "claude-sonnet-4.5",
      tokensUsed: result.usage?.totalTokens,
    },
  });

  // Log validation step
  auditLogger?.log({
    step: "validation",
    action: "Validating AI response structure",
    input: { resultsCount: result.object.results.length },
    reasoning: "AI response validated using structured output schema",
  });

  const analysis = result.object;

  // Normalize flag colors to uppercase (should already be uppercase from schema)
  analysis.results = analysis.results.map((result) => ({
    ...result,
    flagColor: result.flagColor.toUpperCase() as FlagColor,
  }));

  analysis.overallRiskScore =
    analysis.overallRiskScore.toUpperCase() as FlagColor;

  // Log decision step for each rule
  for (const result of analysis.results) {
    const rule = rules.find((r) => r.ruleId === result.ruleId);
    auditLogger?.log({
      step: "decision",
      action: `Decision made for rule ${result.ruleId}`,
      ruleId: rule?.id, // Use database UUID, not the string ruleId
      input: {
        ruleName: rule?.name,
        ruleSeverity: rule?.severity,
        ruleId: result.ruleId, // Keep string ruleId in input for reference
      },
      output: {
        flagColor: result.flagColor,
        explanation: result.explanation,
        evidenceText: result.evidenceText,
        lineNumber: result.lineNumber,
      },
      reasoning: result.explanation,
      extractedData: {
        flagColor: result.flagColor,
        evidence: result.evidenceText,
        lineNumber: result.lineNumber,
      },
    });
  }

  // Log overall decision
  auditLogger?.log({
    step: "decision",
    action: "Overall risk assessment calculated",
    output: {
      overallRiskScore: analysis.overallRiskScore,
      breakdown: {
        red: analysis.results.filter((r) => r.flagColor === "RED").length,
        yellow: analysis.results.filter((r) => r.flagColor === "YELLOW").length,
        green: analysis.results.filter((r) => r.flagColor === "GREEN").length,
      },
    },
    reasoning: `Overall risk score determined based on ${analysis.results.length} rule evaluations`,
  });

  console.log(`Validation successful. ${analysis.results.length} results.`);
  return analysis;
}
