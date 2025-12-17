import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { agreementSchema } from "@/lib/validators/schemas";

export async function GET() {
  try {
    const agreements = await db.agreement.findMany({
      include: {
        entity: true,
        clauses: {
          include: {
            assessments: {
              include: {
                rule: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(agreements);
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
    const validated = agreementSchema.parse(body);

    // Check if entity exists
    const entity = await db.legalEntity.findUnique({
      where: { id: validated.entityId },
    });

    if (!entity) {
      return NextResponse.json(
        { error: "Legal entity not found" },
        { status: 404 }
      );
    }

    const agreement = await db.agreement.create({
      data: {
        title: validated.title,
        fullText: validated.fullText,
        entityId: validated.entityId,
      },
      include: {
        entity: true,
      },
    });

    return NextResponse.json(agreement, { status: 201 });
  } catch (error) {
    console.error("Error creating agreement:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create agreement" },
      { status: 500 }
    );
  }
}

