import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { policyRuleSchema } from "@/lib/validators/schemas";

export async function GET() {
  try {
    const rules = await db.policyRule.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

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

    const rule = await db.policyRule.create({
      data: validated,
    });

    return NextResponse.json(rule, { status: 201 });
  } catch (error) {
    console.error("Error creating rule:", error);
    if (error instanceof Error && error.name === "ZodError") {
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

