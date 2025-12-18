import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { policyRules } from "@/lib/db/schema";
import { policyRuleSchema } from "@/lib/validators/schemas";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const rules = await db
      .select()
      .from(policyRules)
      .orderBy(desc(policyRules.createdAt));

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = policyRuleSchema.parse(body);

    const result = db.insert(policyRules).values(validated).returning().all();
    const rule = result[0];

    if (!rule) {
      return NextResponse.json(
        { error: "Failed to create rule" },
        { status: 500 }
      );
    }

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating rule:", error);
    if (
      error instanceof Error &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create rule" },
      { status: 500 }
    );
  }
}
