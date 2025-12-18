import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agreements, riskAssessments, policyRules } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const agreementsList = db
      .select()
      .from(agreements)
      .orderBy(desc(agreements.createdAt))
      .all();

    // Get assessments for each agreement (synchronous queries)
    const agreementsWithAssessments = agreementsList.map((agreement) => {
      const assessments = db
        .select({
          assessment: riskAssessments,
          rule: policyRules,
        })
        .from(riskAssessments)
        .innerJoin(policyRules, eq(riskAssessments.ruleId, policyRules.id))
        .where(eq(riskAssessments.agreementId, agreement.id))
        .all();

      return {
        ...agreement,
        assessments: assessments.map((a) => ({
          ...a.assessment,
          rule: a.rule,
        })),
      };
    });

    return NextResponse.json(agreementsWithAssessments);
  } catch (error) {
    console.error("Error fetching agreements:", error);
    return NextResponse.json(
      { error: "Failed to fetch agreements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.rawText) {
      return NextResponse.json(
        { error: "Title and rawText are required" },
        { status: 400 }
      );
    }

    // Create agreement
    const result = db
      .insert(agreements)
      .values({
        title: body.title,
        rawText: body.rawText,
      })
      .returning()
      .all();

    const agreement = result[0]!;

    return NextResponse.json(agreement, { status: 201 });
  } catch (error) {
    console.error("Error creating agreement:", error);
    return NextResponse.json(
      { error: "Failed to create agreement" },
      { status: 500 }
    );
  }
}
