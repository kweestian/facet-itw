"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RiskBadge } from "@/components/analysis/risk-badge";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

interface Agreement {
  id: string;
  title: string;
  overallRiskScore: "GREEN" | "YELLOW" | "RED" | null;
  analyzedAt: Date | null;
  createdAt: Date;
  assessments: Array<{
    id: string;
    flagColor: "GREEN" | "YELLOW" | "RED";
    explanation: string;
    rule: {
      ruleId: string;
      name: string;
      severity: string;
    };
  }>;
}

export default function HomePage() {
  const router = useRouter();
  const [agreements, setAgreements] = React.useState<Agreement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [ndaText, setNdaText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/agreements");
      if (response.ok) {
        const data = await response.json();
        setAgreements(data);
      }
    } catch (error) {
      console.error("Error fetching agreements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !ndaText.trim()) {
      alert("Please provide both a title and NDA text");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create agreement
      const response = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          rawText: ndaText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create agreement");
      }

      const agreement = await response.json();

      // Automatically trigger analysis
      const analyzeResponse = await fetch(
        `/api/agreements/${agreement.id}/analyze`,
        {
          method: "POST",
        }
      );

      if (!analyzeResponse.ok) {
        throw new Error("Failed to analyze agreement");
      }

      // Refresh the list and hide form
      await fetchAgreements();
      setShowForm(false);
      setTitle("");
      setNdaText("");

      // Navigate to results
      router.push(`/agreements/${agreement.id}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process NDA. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFlagColorBadge = (color: "GREEN" | "YELLOW" | "RED") => {
    const config = {
      GREEN: {
        label: "GREEN",
        className: "bg-green-100 text-green-800 border-green-300",
      },
      YELLOW: {
        label: "YELLOW",
        className: "bg-yellow-100 text-yellow-800 border-yellow-300",
      },
      RED: {
        label: "RED",
        className: "bg-red-100 text-red-800 border-red-300",
      },
    };
    const { label, className } = config[color];
    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">NDA Policy Checklist</h1>
            <p className="text-muted-foreground">
              View all assessments and create new NDA analyses
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Cancel" : "New Assessment"}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Assessment</CardTitle>
              <CardDescription>
                Enter a title and paste the full NDA text for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Agreement Title</Label>
                  <Input
                    id="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1"
                    placeholder="e.g., NDA with Acme Corp"
                  />
                </div>
                <div>
                  <Label htmlFor="ndaText">NDA Text</Label>
                  <Textarea
                    id="ndaText"
                    required
                    value={ndaText}
                    onChange={(e) => setNdaText(e.target.value)}
                    className="mt-1 min-h-[300px] font-mono text-sm"
                    placeholder="Paste the full NDA text here..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Analyzing..." : "Analyze NDA"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>All Assessments</CardTitle>
            <CardDescription>
              View all NDA assessments and their compliance results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading assessments...
              </div>
            ) : agreements.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assessments yet. Create your first assessment above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Agreement</th>
                      <th className="text-left p-4 font-semibold">
                        Overall Risk
                      </th>
                      <th className="text-left p-4 font-semibold">
                        Assessments
                      </th>
                      <th className="text-left p-4 font-semibold">Analyzed</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agreements.map((agreement) => (
                      <tr
                        key={agreement.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-4">
                          <div className="font-medium">{agreement.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(agreement.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          {agreement.overallRiskScore ? (
                            <RiskBadge
                              riskLevel={
                                agreement.overallRiskScore.toLowerCase() as
                                  | "GREEN"
                                  | "YELLOW"
                                  | "RED"
                              }
                            />
                          ) : (
                            <Badge variant="outline">Not Analyzed</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {agreement.assessments.length === 0 ? (
                              <span className="text-sm text-muted-foreground">
                                No assessments
                              </span>
                            ) : (
                              <>
                                <div className="text-sm font-medium">
                                  {agreement.assessments.length} rule
                                  {agreement.assessments.length !== 1
                                    ? "s"
                                    : ""}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {agreement.assessments.filter(
                                    (a) => a.flagColor === "RED"
                                  ).length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-red-100 text-red-800 border-red-300"
                                    >
                                      {
                                        agreement.assessments.filter(
                                          (a) => a.flagColor === "RED"
                                        ).length
                                      }{" "}
                                      RED
                                    </Badge>
                                  )}
                                  {agreement.assessments.filter(
                                    (a) => a.flagColor === "YELLOW"
                                  ).length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-100 text-yellow-800 border-yellow-300"
                                    >
                                      {
                                        agreement.assessments.filter(
                                          (a) => a.flagColor === "YELLOW"
                                        ).length
                                      }{" "}
                                      YELLOW
                                    </Badge>
                                  )}
                                  {agreement.assessments.filter(
                                    (a) => a.flagColor === "GREEN"
                                  ).length > 0 && (
                                    <Badge
                                      variant="outline"
                                      className="bg-green-100 text-green-800 border-green-300"
                                    >
                                      {
                                        agreement.assessments.filter(
                                          (a) => a.flagColor === "GREEN"
                                        ).length
                                      }{" "}
                                      GREEN
                                    </Badge>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {agreement.analyzedAt
                            ? new Date(agreement.analyzedAt).toLocaleString()
                            : "Not analyzed"}
                        </td>
                        <td className="p-4">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/agreements/${agreement.id}`}>
                              View Details
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
