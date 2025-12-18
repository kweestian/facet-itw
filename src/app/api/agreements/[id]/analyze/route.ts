import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import {
  agreements,
  policyRules,
  riskAssessments,
  auditTrails,
} from "@/lib/db/schema";
import { analyzeNDAAgainstPolicyChecklist } from "@/lib/ai/analyzer";
import { AuditTrailLogger } from "@/lib/audit/audit-trail";
import { eq } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log(`Starting analysis for agreement ${id}`);

  try {
    // Get agreement
    const agreement = db
      .select()
      .from(agreements)
      .where(eq(agreements.id, id))
      .limit(1)
      .get();

    if (!agreement) {
      console.error(`Agreement ${id} not found`);
      return new Response(JSON.stringify({ error: "Agreement not found" }), {
        status: 404,
      });
    }

    console.log(`Found agreement: ${agreement.title}`);

    // Get all active policy rules
    const rules = db
      .select()
      .from(policyRules)
      .where(eq(policyRules.isActive, true))
      .all();

    if (rules.length === 0) {
      console.error("No active policy rules found");
      return new Response(
        JSON.stringify({ error: "No active policy rules found" }),
        { status: 400 }
      );
    }

    console.log(`Found ${rules.length} active policy rules`);

    // Initialize audit trail logger
    const auditLogger = new AuditTrailLogger(id);

    // Delete existing audit trails for this agreement
    db.delete(auditTrails).where(eq(auditTrails.agreementId, id)).run();

    // Analyze NDA against policy checklist
    console.log("Calling AI analyzer...");
    const analysis = await analyzeNDAAgainstPolicyChecklist(
      agreement.rawText,
      rules.map((r) => ({
        id: r.id, // Database UUID
        ruleId: r.ruleId, // String identifier
        name: r.name,
        description: r.description,
        acceptanceCriteria: r.acceptanceCriteria,
        severity: r.severity as "SHOW_STOPPER" | "NEGOTIABLE" | "COMPLIANT",
      })),
      auditLogger
    );

    console.log(`Analysis complete. Results: ${analysis.results.length}`);

    // Save audit trail
    await auditLogger.save();

    // Delete existing assessments for this agreement
    db.delete(riskAssessments).where(eq(riskAssessments.agreementId, id)).run();

    // Create new assessments
    for (const result of analysis.results) {
      const rule = rules.find((r) => r.ruleId === result.ruleId);
      if (rule) {
        db.insert(riskAssessments)
          .values({
            agreementId: id,
            ruleId: rule.id,
            flagColor: result.flagColor,
            explanation: result.explanation,
            evidenceText: result.evidenceText || null,
          })
          .run();
      }
    }

    // Update agreement with overall risk score
    db.update(agreements)
      .set({
        overallRiskScore: analysis.overallRiskScore,
        analyzedAt: new Date(),
      })
      .where(eq(agreements.id, id))
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        overallRiskScore: analysis.overallRiskScore,
        resultsCount: analysis.results.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
