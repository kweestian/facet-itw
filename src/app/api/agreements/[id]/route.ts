import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agreements, riskAssessments, policyRules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const agreement = db
      .select()
      .from(agreements)
      .where(eq(agreements.id, id))
      .limit(1)
      .get();

    if (!agreement) {
      return NextResponse.json(
        { error: "Agreement not found" },
        { status: 404 }
      );
    }

    // Get assessments with rules
    const assessments = db
      .select({
        assessment: riskAssessments,
        rule: policyRules,
      })
      .from(riskAssessments)
      .innerJoin(policyRules, eq(riskAssessments.ruleId, policyRules.id))
      .where(eq(riskAssessments.agreementId, id))
      .all();

    return NextResponse.json({
      ...agreement,
      assessments: assessments.map((a) => ({
        ...a.assessment,
        rule: a.rule,
      })),
    });
  } catch (error) {
    console.error("Error fetching agreement:", error);
    return NextResponse.json(
      { error: "Failed to fetch agreement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    db.delete(agreements).where(eq(agreements.id, id)).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting agreement:", error);
    return NextResponse.json(
      { error: "Failed to delete agreement" },
      { status: 500 }
    );
  }
}
