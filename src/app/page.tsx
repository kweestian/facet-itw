"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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

export default function HomePage() {
  const router = useRouter();
  const [title, setTitle] = React.useState("");
  const [ndaText, setNdaText] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

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

      // Navigate to results
      router.push(`/agreements/${agreement.id}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to process NDA. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">NDA Policy Checklist</h1>
          <p className="text-muted-foreground">
            Paste your NDA text below to analyze it against our internal policy
            checklist
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Analyze NDA</CardTitle>
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
                  className="mt-1 min-h-[400px] font-mono text-sm"
                  placeholder="Paste the full NDA text here..."
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Analyzing..." : "Analyze NDA"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
