import { streamText } from "ai";
import { aiModel } from "./client";
import type { RiskLevel } from "@/types";

export interface RuleMatch {
  matches: boolean;
  riskLevel: RiskLevel;
  explanation: string;
  evidence: Array<{
    text: string;
    startOffset: number;
    endOffset: number;
  }>;
  confidence?: number;
}

export async function analyzeClauseAgainstRule(
  clauseText: string,
  ruleName: string,
  ruleDescription: string,
  ruleText: string,
): Promise<RuleMatch> {
  const prompt = `You are a legal compliance analyst. Analyze whether a clause violates or raises concerns about a specific policy rule.

Clause to analyze:
${clauseText}

Policy Rule:
Name: ${ruleName}
Description: ${ruleDescription}
Rule Details: ${ruleText}

Analyze the clause and return a JSON object with:
- matches: boolean - true if the clause violates or raises concerns about this rule
- riskLevel: "green" | "yellow" | "red"
  - "green": No issues, clause is compliant
  - "yellow": Potential concerns, review recommended
  - "red": Clear violation or high risk, show-stopper
- explanation: string - detailed explanation of your assessment
- evidence: array of objects with:
  - text: exact text snippet from the clause that supports your assessment
  - startOffset: character position where this text starts in the clause
  - endOffset: character position where this text ends
- confidence: number between 0.0 and 1.0 indicating confidence in your assessment

Be precise with evidence - quote exact text from the clause. Return ONLY valid JSON, no markdown formatting.`;

  const result = await streamText({
    model: aiModel,
    prompt,
    temperature: 0.2,
  });

  let fullText = "";
  for await (const chunk of result.textStream) {
    fullText += chunk;
  }

  // Clean up the response
  const cleaned = fullText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    const match = JSON.parse(cleaned) as RuleMatch;
    
    // Validate and normalize
    if (!["green", "yellow", "red"].includes(match.riskLevel)) {
      match.riskLevel = match.matches ? "yellow" : "green";
    }
    
    // Ensure evidence has proper offsets
    match.evidence = match.evidence.map((ev) => {
      const offset = clauseText.indexOf(ev.text);
      return {
        ...ev,
        startOffset: offset >= 0 ? offset : ev.startOffset,
        endOffset: offset >= 0 ? offset + ev.text.length : ev.endOffset,
      };
    });

    return match;
  } catch (error) {
    console.error("Failed to parse rule analysis:", error);
    // Fallback: no match
    return {
      matches: false,
      riskLevel: "green",
      explanation: "Unable to analyze clause - parsing error occurred",
      evidence: [],
      confidence: 0.0,
    };
  }
}

