"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AgreementFormProps {
  entities: Array<{ id: string; name: string }>;
}

export function AgreementForm({ entities }: AgreementFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    fullText: "",
    entityId: entities[0]?.id || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/agreements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create agreement");
      }

      const agreement = await response.json();
      router.push(`/agreements/${agreement.id}`);
    } catch (error) {
      console.error("Error creating agreement:", error);
      alert("Failed to create agreement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Agreement</CardTitle>
        <CardDescription>Upload or paste agreement text for analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Agreement Title</Label>
            <Input
              id="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
              placeholder="e.g., Service Agreement with Acme Corp"
            />
          </div>

          <div>
            <Label htmlFor="entityId">Legal Entity</Label>
            <Select
              value={formData.entityId}
              onValueChange={(value) => setFormData({ ...formData, entityId: value })}
              required
            >
              <SelectTrigger id="entityId" className="mt-1">
                <SelectValue placeholder="Select an entity" />
              </SelectTrigger>
              <SelectContent>
                {entities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="fullText">Agreement Text</Label>
            <Textarea
              id="fullText"
              required
              value={formData.fullText}
              onChange={(e) => setFormData({ ...formData, fullText: e.target.value })}
              className="mt-1 min-h-[300px] font-mono text-sm"
              placeholder="Paste the full agreement text here..."
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Agreement"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

