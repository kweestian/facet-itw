import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Enums as text columns with check constraints
export const riskScoreEnum = ["GREEN", "YELLOW", "RED"] as const;
export const ruleSeverityEnum = [
  "SHOW_STOPPER",
  "NEGOTIABLE",
  "COMPLIANT",
] as const;
export const flagColorEnum = ["GREEN", "YELLOW", "RED"] as const;

// Agreement Table
export const agreements = sqliteTable(
  "agreement",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    rawText: text("raw_text").notNull(),
    overallRiskScore: text("overall_risk_score", { enum: riskScoreEnum }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    analyzedAt: integer("analyzed_at", { mode: "timestamp" }),
  },
  (table) => ({
    riskScoreIdx: index("agreement_risk_score_idx").on(table.overallRiskScore),
    createdAtIdx: index("agreement_created_at_idx").on(table.createdAt),
  })
);

// PolicyRule Table
export const policyRules = sqliteTable(
  "policy_rule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ruleId: text("rule_id").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    acceptanceCriteria: text("acceptance_criteria").notNull(),
    severity: text("severity", { enum: ruleSeverityEnum }).notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    ruleIdUnique: uniqueIndex("policy_rule_rule_id_unique").on(table.ruleId),
    severityIdx: index("policy_rule_severity_idx").on(table.severity),
    isActiveIdx: index("policy_rule_is_active_idx").on(table.isActive),
  })
);

// RiskAssessment Table (simplified - directly on agreement, no clause needed)
export const riskAssessments = sqliteTable(
  "risk_assessment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    agreementId: text("agreement_id")
      .notNull()
      .references(() => agreements.id, { onDelete: "cascade" }),
    ruleId: text("rule_id")
      .notNull()
      .references(() => policyRules.id, { onDelete: "cascade" }),
    flagColor: text("flag_color", { enum: flagColorEnum }).notNull(),
    explanation: text("explanation").notNull(),
    evidenceText: text("evidence_text"), // Relevant text from the NDA
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    agreementIdIdx: index("risk_assessment_agreement_id_idx").on(
      table.agreementId
    ),
    ruleIdIdx: index("risk_assessment_rule_id_idx").on(table.ruleId),
    flagColorIdx: index("risk_assessment_flag_color_idx").on(table.flagColor),
  })
);

// Audit Trail Table - tracks AI reasoning, extractions, and decisions
export const auditTrails = sqliteTable(
  "audit_trail",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    agreementId: text("agreement_id")
      .notNull()
      .references(() => agreements.id, { onDelete: "cascade" }),
    step: text("step").notNull(), // "extraction", "rule_evaluation", "decision"
    stepOrder: integer("step_order").notNull(), // Order of execution
    ruleId: text("rule_id").references(() => policyRules.id, {
      onDelete: "cascade",
    }), // Null for extraction steps
    action: text("action").notNull(), // What happened
    input: text("input"), // JSON: Input to this step
    output: text("output"), // JSON: Output from this step
    reasoning: text("reasoning"), // Why this decision was made
    extractedData: text("extracted_data"), // JSON: Structured data extracted
    metadata: text("metadata"), // JSON: Additional context
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => ({
    agreementIdIdx: index("audit_trail_agreement_id_idx").on(table.agreementId),
    stepOrderIdx: index("audit_trail_step_order_idx").on(table.stepOrder),
    ruleIdIdx: index("audit_trail_rule_id_idx").on(table.ruleId),
  })
);

// Relations
export const agreementsRelations = relations(agreements, ({ many }) => ({
  assessments: many(riskAssessments),
  auditTrails: many(auditTrails),
}));

export const policyRulesRelations = relations(policyRules, ({ many }) => ({
  assessments: many(riskAssessments),
  auditTrails: many(auditTrails),
}));

export const riskAssessmentsRelations = relations(
  riskAssessments,
  ({ one }) => ({
    agreement: one(agreements, {
      fields: [riskAssessments.agreementId],
      references: [agreements.id],
    }),
    rule: one(policyRules, {
      fields: [riskAssessments.ruleId],
      references: [policyRules.id],
    }),
  })
);

export const auditTrailsRelations = relations(auditTrails, ({ one }) => ({
  agreement: one(agreements, {
    fields: [auditTrails.agreementId],
    references: [agreements.id],
  }),
  rule: one(policyRules, {
    fields: [auditTrails.ruleId],
    references: [policyRules.id],
  }),
}));

// Type exports
export type Agreement = typeof agreements.$inferSelect;
export type NewAgreement = typeof agreements.$inferInsert;
export type PolicyRule = typeof policyRules.$inferSelect;
export type NewPolicyRule = typeof policyRules.$inferInsert;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type NewRiskAssessment = typeof riskAssessments.$inferInsert;
export type AuditTrail = typeof auditTrails.$inferSelect;
export type NewAuditTrail = typeof auditTrails.$inferInsert;
