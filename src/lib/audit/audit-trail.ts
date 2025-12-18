import { db } from "@/lib/db";
import { auditTrails } from "@/lib/db/schema";

export type AuditStep =
  | "extraction"
  | "rule_evaluation"
  | "decision"
  | "validation";

export interface AuditTrailEntry {
  agreementId: string;
  step: AuditStep;
  stepOrder: number;
  ruleId?: string;
  action: string;
  input?: unknown;
  output?: unknown;
  reasoning?: string;
  extractedData?: unknown;
  metadata?: unknown;
}

export class AuditTrailLogger {
  private agreementId: string;
  private stepOrder: number = 0;
  private entries: AuditTrailEntry[] = [];

  constructor(agreementId: string) {
    this.agreementId = agreementId;
  }

  log(entry: Omit<AuditTrailEntry, "agreementId" | "stepOrder">) {
    this.stepOrder++;
    this.entries.push({
      ...entry,
      agreementId: this.agreementId,
      stepOrder: this.stepOrder,
    });
  }

  async save(): Promise<void> {
    if (this.entries.length === 0) return;

    for (const entry of this.entries) {
      db.insert(auditTrails)
        .values({
          agreementId: entry.agreementId,
          step: entry.step,
          stepOrder: entry.stepOrder,
          ruleId: entry.ruleId || null,
          action: entry.action,
          input: entry.input ? JSON.stringify(entry.input) : null,
          output: entry.output ? JSON.stringify(entry.output) : null,
          reasoning: entry.reasoning || null,
          extractedData: entry.extractedData
            ? JSON.stringify(entry.extractedData)
            : null,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        })
        .run();
    }
  }
}
