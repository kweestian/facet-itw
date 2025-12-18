import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auditTrails, policyRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get audit trails with rule information
    const trails = db
      .select({
        trail: auditTrails,
        rule: policyRules,
      })
      .from(auditTrails)
      .leftJoin(policyRules, eq(auditTrails.ruleId, policyRules.id))
      .where(eq(auditTrails.agreementId, id))
      .orderBy(auditTrails.stepOrder)
      .all();

    const formattedTrails = trails.map((row) => ({
      ...row.trail,
      rule: row.rule,
      input: row.trail.input ? JSON.parse(row.trail.input) : null,
      output: row.trail.output ? JSON.parse(row.trail.output) : null,
      extractedData: row.trail.extractedData
        ? JSON.parse(row.trail.extractedData)
        : null,
      metadata: row.trail.metadata ? JSON.parse(row.trail.metadata) : null,
    }));

    return NextResponse.json(formattedTrails);
  } catch (error) {
    console.error("Error fetching audit trails:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit trails" },
      { status: 500 }
    );
  }
}
