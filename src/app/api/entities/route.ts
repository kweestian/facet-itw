import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { legalEntitySchema } from "@/lib/validators/schemas";

export async function GET() {
  try {
    const entities = await db.legalEntity.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(entities);
  } catch (error) {
    console.error("Error fetching entities:", error);
    return NextResponse.json(
      { error: "Failed to fetch entities" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = legalEntitySchema.parse(body);

    const entity = await db.legalEntity.create({
      data: validated,
    });

    return NextResponse.json(entity, { status: 201 });
  } catch (error) {
    console.error("Error creating entity:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create entity" },
      { status: 500 }
    );
  }
}

