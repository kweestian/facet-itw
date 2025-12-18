import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agreements } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const agreementsList = await db
      .select()
      .from(agreements)
      .orderBy(desc(agreements.createdAt));

    return NextResponse.json(agreementsList);
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
