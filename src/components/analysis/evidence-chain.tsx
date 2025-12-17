import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "./risk-badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface EvidenceChainProps {
  clause: {
    id: string;
    clauseNumber?: string | null;
    title?: string | null;
    content: string;
  };
  assessments: Array<{
    id: string;
    riskLevel: string;
    explanation: string;
    confidence?: number | null;
    rule: {
      id: string;
      name: string;
      description: string;
      category: string;
    };
    evidence: Array<{
      id: string;
      evidenceText: string;
      startOffset: number;
      endOffset: number;
      contextBefore?: string | null;
      contextAfter?: string | null;
    }>;
  }>;
}

export function EvidenceChain({ clause, assessments }: EvidenceChainProps) {
  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">No risk assessments found for this clause.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Clause {clause.clauseNumber || "N/A"}
            {clause.title && `: ${clause.title}`}
          </CardTitle>
          <CardDescription className="whitespace-pre-wrap">{clause.content}</CardDescription>
        </CardHeader>
      </Card>

      <Accordion type="single" collapsible className="w-full">
        {assessments.map((assessment) => (
          <AccordionItem key={assessment.id} value={assessment.id}>
            <AccordionTrigger>
              <div className="flex items-center gap-3 text-left">
                <RiskBadge riskLevel={assessment.riskLevel as "green" | "yellow" | "red"} />
                <div>
                  <div className="font-medium">{assessment.rule.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {assessment.rule.category}
                    {assessment.confidence && ` • ${Math.round(assessment.confidence * 100)}% confidence`}
                  </div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pt-2">
                <div>
                  <h4 className="text-sm font-semibold mb-2">Rule Description</h4>
                  <p className="text-sm text-muted-foreground">{assessment.rule.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Analysis</h4>
                  <p className="text-sm">{assessment.explanation}</p>
                </div>

                {assessment.evidence.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Evidence</h4>
                    <div className="space-y-2">
                      {assessment.evidence.map((ev) => (
                        <Card key={ev.id}>
                          <CardContent className="pt-4">
                            <div className="space-y-2">
                              {ev.contextBefore && (
                                <p className="text-xs text-muted-foreground">
                                  ...{ev.contextBefore}
                                </p>
                              )}
                              <p className="text-sm font-mono bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                                {ev.evidenceText}
                              </p>
                              {ev.contextAfter && (
                                <p className="text-xs text-muted-foreground">
                                  {ev.contextAfter}...
                                </p>
                              )}
                              <div className="text-xs text-muted-foreground">
                                Characters {ev.startOffset}-{ev.endOffset}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

