import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { extractClauses } from "@/lib/ai/extractor";
import { analyzeClauseAgainstRule } from "@/lib/ai/analyzer";
import { streamText } from "ai";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const agreement = await db.agreement.findUnique({
    where: { id },
    include: {
      clauses: true,
    },
  });

  if (!agreement) {
    return new Response(JSON.stringify({ error: "Agreement not found" }), {
      status: 404,
    });
  }

  // Get all active policy rules
  const rules = await db.policyRule.findMany({
    where: { isActive: true },
  });

  if (rules.length === 0) {
    return new Response(
      JSON.stringify({ error: "No active policy rules found" }),
      { status: 400 }
    );
  }

  // Create a readable stream for progress updates
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Step 1: Extract clauses if not already extracted
        let clauses = agreement.clauses;

        if (clauses.length === 0) {
          const sendProgress = (data: any) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          };

          sendProgress({
            type: "progress",
            status: "extracting",
            message: "Extracting clauses from agreement...",
          });

          const extracted = await extractClauses(agreement.fullText);

          // Save clauses to database
          clauses = await Promise.all(
            extracted.map((clause) =>
              db.clause.create({
                data: {
                  agreementId: id,
                  clauseNumber: clause.clauseNumber,
                  title: clause.title,
                  content: clause.content,
                  startOffset: clause.startOffset,
                  endOffset: clause.endOffset,
                },
              })
            )
          );

          await db.agreement.update({
            where: { id },
            data: { status: "analyzed" },
          });
        }

        // Step 2: Analyze each clause against each rule
        const totalClauses = clauses.length;
        let currentClause = 0;

        for (const clause of clauses) {
          currentClause++;

          const sendProgress = (data: any) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          };

          sendProgress({
            type: "progress",
            status: "analyzing",
            clauseId: clause.id,
            clauseNumber: clause.clauseNumber,
            totalClauses,
            currentClause,
            message: `Analyzing clause ${currentClause} of ${totalClauses}...`,
          });

          // Analyze against each rule
          for (const rule of rules) {
            const match = await analyzeClauseAgainstRule(
              clause.content,
              rule.name,
              rule.description,
              rule.ruleText
            );

            // Only create assessment if there's a match or risk
            if (match.matches || match.riskLevel !== "green") {
              const assessment = await db.riskAssessment.create({
                data: {
                  clauseId: clause.id,
                  ruleId: rule.id,
                  riskLevel: match.riskLevel,
                  explanation: match.explanation,
                  confidence: match.confidence,
                },
              });

              // Save evidence
              if (match.evidence.length > 0) {
                await Promise.all(
                  match.evidence.map((ev) =>
                    db.fullText.create({
                      data: {
                        assessmentId: assessment.id,
                        evidenceText: ev.text,
                        startOffset: ev.startOffset,
                        endOffset: ev.endOffset,
                      },
                    })
                  )
                );
              }
            }
          }
        }

        // Mark agreement as analyzed
        await db.agreement.update({
          where: { id },
          data: {
            status: "analyzed",
            analyzedAt: new Date(),
          },
        });

        sendProgress({
          type: "complete",
          message: "Analysis complete!",
        });

        controller.close();
      } catch (error) {
        console.error("Analysis error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : "Unknown error",
            })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

