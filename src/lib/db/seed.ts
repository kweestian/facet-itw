// Load environment variables
import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env") });

import { db } from "./index";
import { policyRules } from "./schema";
import { eq } from "drizzle-orm";

function main() {
  console.log("Seeding database...");

  // Create Policy Rules based on the NDA Review Checklist
  const rules = [
    {
      ruleId: "MUTUALITY-001",
      name: "Mutuality of Protection",
      description:
        "NDAs should protect confidential information of both parties equally. One-way NDAs are disfavored.",
      acceptanceCriteria: `NDAs should protect confidential information of both parties equally.
- PASS: Both parties have reciprocal confidentiality obligations
- FAIL: Only one party has confidentiality obligations (one-way NDA)
- Escalation: One-way NDAs require Legal approval except in very narrow circumstances (e.g., regulatory filings)`,
      severity: "SHOW_STOPPER" as const,
      isActive: true,
    },
    {
      ruleId: "EXCEPTIONS-001",
      name: "Standard Exceptions to Confidentiality",
      description:
        "NDAs must recognize that certain categories of information should not be considered confidential.",
      acceptanceCriteria: `At minimum, exceptions must include:
- Information already known to the receiving party before disclosure
- Information independently developed by the receiving party
- Information obtained from a third party lawfully and without breach of an obligation of confidentiality
- Information publicly available without fault of the receiving party
- "Approved in writing by the discloser"
- FAIL: If any one of these exceptions is missing, Legal must assess risk before approval`,
      severity: "SHOW_STOPPER" as const,
      isActive: true,
    },
    {
      ruleId: "IP-001",
      name: "Intellectual Property Rights",
      description:
        "The NDA must make clear that ownership of intellectual property remains with the original owner.",
      acceptanceCriteria: `The NDA must explicitly state no transfer of IP or implied license.
- PASS: Clear statement that IP ownership remains with original owner
- FAIL: Silence on ownership or language suggesting IP transfer
- Escalation: Ambiguous or missing IP ownership clauses require Legal review`,
      severity: "SHOW_STOPPER" as const,
      isActive: true,
    },
    {
      ruleId: "TERM-001",
      name: "Term of Confidentiality",
      description:
        "Confidentiality obligations must last for at least 12 months after the end of the NDA.",
      acceptanceCriteria: `Confidentiality obligations must last for at least 12 months after the end of the NDA.
- PREFERRED: 2-3 years
- NOT ACCEPTABLE: Obligations that expire upon termination of the NDA itself, or any period shorter than 12 months
- Escalation: Duration less than 2 years but at least 1 year is preferred but negotiable`,
      severity: "NEGOTIABLE" as const,
      isActive: true,
    },
    {
      ruleId: "INDEMNITY-001",
      name: "Indemnities",
      description: "NDAs are not intended to create indemnity obligations.",
      acceptanceCriteria: `NDAs should not contain indemnity provisions.
- PASS: No indemnity clauses present
- FAIL: Any provision requiring one party to indemnify the other
- IMMEDIATE ESCALATION: Even "narrow" indemnities (e.g., for willful misconduct) complicate negotiations and should be avoided`,
      severity: "SHOW_STOPPER" as const,
      isActive: true,
    },
    {
      ruleId: "REMEDIES-001",
      name: "Remedies",
      description:
        "It is acceptable for NDAs to allow for equitable remedies, but monetary penalties are not acceptable.",
      acceptanceCriteria: `Remedies clauses should allow equitable remedies (injunctions, specific performance).
- PASS: Equitable remedies allowed
- FAIL: Provisions specifying monetary penalties or liquidated damages
- IMMEDIATE ESCALATION: Liquidated damages provisions require Legal review`,
      severity: "SHOW_STOPPER" as const,
      isActive: true,
    },
    {
      ruleId: "DATA-001",
      name: "Data Protection References",
      description:
        "NDAs should not attempt to incorporate or reference data processing agreements or GDPR-specific terms.",
      acceptanceCriteria: `NDAs should not reference DPAs or GDPR-specific terms.
- PASS: NDA is silent on data protection, or references separate DPA
- FAIL: NDA attempts to incorporate DPA terms or GDPR-specific language
- Escalation: If personal data is anticipated, a separate DPA must be executed`,
      severity: "NEGOTIABLE" as const,
      isActive: true,
    },
    {
      ruleId: "NON_SOLICIT-001",
      name: "Non-Solicitation",
      description:
        "NDAs should not contain restrictions on recruiting or soliciting employees.",
      acceptanceCriteria: `NDAs should not contain employee recruiting restrictions.
- PASS: No non-solicitation clauses
- FAIL: Restrictions on recruiting or soliciting employees
- Escalation: Recruiting restrictions must be handled separately in commercial agreements if necessary`,
      severity: "NEGOTIABLE" as const,
      isActive: true,
    },
    {
      ruleId: "JURISDICTION-001",
      name: "Choice of Law and Jurisdiction",
      description:
        "Acceptable governing law/jurisdiction options are limited to specific jurisdictions.",
      acceptanceCriteria: `Acceptable governing law/jurisdiction:
- Delaware (DE)
- New York (NY)
- California (CA)
- England and Wales (UK)
- Singapore (SG)
- IMMEDIATE ESCALATION: Any other jurisdiction (e.g., France, Germany, Hong Kong) requires Legal approval`,
      severity: "SHOW_STOPPER" as const,
      isActive: true,
    },
    {
      ruleId: "MISC-001",
      name: "Miscellaneous Provisions",
      description:
        "Entire Agreement, Amendments, and Counterparts provisions are generally acceptable, but some clauses should be flagged.",
      acceptanceCriteria: `Miscellaneous provisions review:
- PASS: Entire Agreement, Amendments, and Counterparts provisions are acceptable
- FLAG: Broad "no assignment" clauses that prevent corporate transactions (e.g., M&A, internal restructuring)
- FLAG: Confidential information defined so broadly as to include residual knowledge in employees' unaided memory
- Escalation: Problematic miscellaneous provisions require Legal review`,
      severity: "NEGOTIABLE" as const,
      isActive: true,
    },
  ];

  for (const rule of rules) {
    const existing = db
      .select()
      .from(policyRules)
      .where(eq(policyRules.ruleId, rule.ruleId))
      .limit(1)
      .get();

    if (existing) {
      db.update(policyRules)
        .set(rule)
        .where(eq(policyRules.id, existing.id))
        .run();
      console.log(`Updated rule: ${rule.name} (${rule.ruleId})`);
    } else {
      const result = db.insert(policyRules).values(rule).returning().all();
      if (result && result[0]) {
        console.log(`Created rule: ${result[0].name} (${result[0].ruleId})`);
      }
    }
  }

  console.log("✅ Seeding complete!");
}

try {
  main();
} catch (e) {
  console.error("Error seeding database:", e);
  process.exit(1);
}
