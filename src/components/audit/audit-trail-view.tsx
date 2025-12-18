"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AuditTrailEntry {
  id: string;
  step: string;
  stepOrder: number;
  ruleId?: string | null;
  action: string;
  input?: unknown;
  output?: unknown;
  reasoning?: string | null;
  extractedData?: unknown;
  metadata?: unknown;
  createdAt: Date;
  rule?: {
    name: string;
    ruleId: string;
  } | null;
}

interface AuditTrailViewProps {
  agreementId: string;
}

export function AuditTrailView({ agreementId }: AuditTrailViewProps) {
  const [trails, setTrails] = React.useState<AuditTrailEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchTrails() {
      try {
        const response = await fetch(`/api/agreements/${agreementId}/audit`);
        if (response.ok) {
          const data = await response.json();
          setTrails(data);
        }
      } catch (error) {
        console.error("Error fetching audit trails:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrails();
  }, [agreementId]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-4">Loading audit trail...</CardContent>
      </Card>
    );
  }

  if (trails.length === 0) {
    return (
      <Card>
        <CardContent className="py-4 text-muted-foreground text-center">
          No audit trail available
        </CardContent>
      </Card>
    );
  }

  // Group trails by step type
  const groupedTrails = trails.reduce((acc, trail) => {
    if (!acc[trail.step]) {
      acc[trail.step] = [];
    }
    acc[trail.step].push(trail);
    return acc;
  }, {} as Record<string, AuditTrailEntry[]>);

  const stepLabels: Record<string, string> = {
    extraction: "📥 Extraction",
    rule_evaluation: "🔍 Rule Evaluation",
    validation: "✅ Validation",
    decision: "⚖️ Decision",
  };

  const stepColors: Record<string, string> = {
    extraction: "bg-blue-100 text-blue-800 border-blue-300",
    rule_evaluation: "bg-purple-100 text-purple-800 border-purple-300",
    validation: "bg-green-100 text-green-800 border-green-300",
    decision: "bg-orange-100 text-orange-800 border-orange-300",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>
          Complete reasoning chain: what was extracted, which rules fired, and
          why decisions were made
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(groupedTrails).map(([step, stepTrails]) => (
            <AccordionItem key={step} value={step}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={stepColors[step] || "bg-gray-100 text-gray-800"}
                  >
                    {stepLabels[step] || step}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {stepTrails.length}{" "}
                    {stepTrails.length === 1 ? "entry" : "entries"}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  {stepTrails.map((trail) => (
                    <div
                      key={trail.id}
                      className="border-l-2 border-muted pl-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{trail.action}</p>
                          {trail.rule && (
                            <p className="text-sm text-muted-foreground">
                              Rule: {trail.rule.name} ({trail.rule.ruleId})
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Step {trail.stepOrder}
                        </span>
                      </div>

                      {trail.reasoning && (
                        <div>
                          <p className="text-sm font-medium mb-1">Reasoning:</p>
                          <p className="text-sm text-muted-foreground">
                            {trail.reasoning}
                          </p>
                        </div>
                      )}

                      {trail.extractedData && (
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Extracted Data:
                          </p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(trail.extractedData, null, 2)}
                          </pre>
                        </div>
                      )}

                      {trail.input && (
                        <div>
                          <p className="text-sm font-medium mb-1">Input:</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(trail.input, null, 2)}
                          </pre>
                        </div>
                      )}

                      {trail.output && (
                        <div>
                          <p className="text-sm font-medium mb-1">Output:</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(trail.output, null, 2)}
                          </pre>
                        </div>
                      )}

                      {trail.metadata && (
                        <div>
                          <p className="text-sm font-medium mb-1">Metadata:</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                            {JSON.stringify(trail.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
