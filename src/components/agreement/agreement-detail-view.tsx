"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BizDevDashboard } from "@/components/analysis/bizdev-dashboard";
import { CounselDashboard } from "@/components/analysis/counsel-dashboard";
import { AnalysisStream } from "@/components/analysis/analysis-stream";
import { Card, CardContent } from "@/components/ui/card";

interface AgreementDetailViewProps {
  agreement: {
    id: string;
    title: string;
    status: string;
    clauses: Array<{
      id: string;
      clauseNumber?: string | null;
      title?: string | null;
      content: string;
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
    }>;
  };
}

export function AgreementDetailView({ agreement }: AgreementDetailViewProps) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [progress, setProgress] = React.useState<{
    clauseId: string;
    clauseNumber?: string;
    totalClauses: number;
    currentClause: number;
    status: "extracting" | "analyzing" | "complete";
  } | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setProgress({
      clauseId: "",
      totalClauses: 0,
      currentClause: 0,
      status: "extracting",
    });

    try {
      const response = await fetch(`/api/agreements/${agreement.id}/analyze`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "progress") {
                setProgress({
                  clauseId: data.clauseId || "",
                  clauseNumber: data.clauseNumber,
                  totalClauses: data.totalClauses || 0,
                  currentClause: data.currentClause || 0,
                  status: data.status,
                });
              } else if (data.type === "complete") {
                setIsAnalyzing(false);
                setProgress(null);
                router.refresh();
              } else if (data.type === "error") {
                console.error("Analysis error:", data.message);
                setIsAnalyzing(false);
                setProgress(null);
                alert(`Analysis error: ${data.message}`);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error("Error during analysis:", error);
      setIsAnalyzing(false);
      setProgress(null);
      alert("Failed to analyze agreement. Please try again.");
    }
  };

  // Calculate summary for BizDev dashboard
  const allAssessments = agreement.clauses.flatMap((c) => c.assessments);
  const summary = {
    totalClauses: agreement.clauses.length,
    green: allAssessments.filter((a) => a.riskLevel === "green").length,
    yellow: allAssessments.filter((a) => a.riskLevel === "yellow").length,
    red: allAssessments.filter((a) => a.riskLevel === "red").length,
  };

  // Get show-stoppers (red risk assessments)
  const showStoppers = agreement.clauses
    .filter((c) => c.assessments.some((a) => a.riskLevel === "red"))
    .map((c) => {
      const redAssessment = c.assessments.find((a) => a.riskLevel === "red");
      return {
        clauseId: c.id,
        clauseNumber: c.clauseNumber,
        title: c.title,
        riskLevel: "red",
        ruleName: redAssessment?.rule.name || "Unknown",
      };
    });

  return (
    <div className="space-y-6">
      {isAnalyzing && progress && (
        <AnalysisStream progress={progress} />
      )}

      {agreement.status === "draft" && !isAnalyzing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground">
                  This agreement hasn't been analyzed yet. Click the button below to start.
                </p>
              </div>
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {agreement.status === "analyzed" && (
        <Tabs defaultValue="bizdev" className="w-full">
          <TabsList>
            <TabsTrigger value="bizdev">BizDev View</TabsTrigger>
            <TabsTrigger value="counsel">Counsel View</TabsTrigger>
          </TabsList>
          <TabsContent value="bizdev" className="mt-6">
            <BizDevDashboard summary={summary} showStoppers={showStoppers} />
          </TabsContent>
          <TabsContent value="counsel" className="mt-6">
            <CounselDashboard clauses={agreement.clauses} />
          </TabsContent>
        </Tabs>
      )}

      {agreement.status === "analyzed" && (
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleAnalyze} disabled={isAnalyzing} variant="outline">
              {isAnalyzing ? "Re-analyzing..." : "Re-analyze Agreement"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

