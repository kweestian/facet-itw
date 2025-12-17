import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default workspace entity
  let workspace = await prisma.legalEntity.findFirst({
    where: { name: "Demo Workspace" },
  });

  if (!workspace) {
    workspace = await prisma.legalEntity.create({
      data: {
        name: "Demo Workspace",
        entityType: "Company",
      },
    });
  }

  console.log("Created workspace entity:", workspace.name);

  // Create sample policy rules
  const rules = [
    {
      name: "Data Privacy - GDPR Compliance",
      description: "Ensures clauses comply with GDPR data protection requirements",
      ruleText: "Check for clauses that mention data processing, personal data, or data transfers. Ensure they include appropriate safeguards, consent mechanisms, and data subject rights. Flag any clauses that allow unrestricted data processing or lack proper data protection measures.",
      category: "Data Privacy",
      severity: "high",
      isActive: true,
    },
    {
      name: "Liability Limitation",
      description: "Identifies overly broad liability limitations or exclusions",
      ruleText: "Identify clauses that limit or exclude liability. Flag clauses that completely exclude liability for gross negligence, willful misconduct, or breach of confidentiality. Also flag clauses with unlimited liability caps that could expose the company to excessive risk.",
      category: "Liability",
      severity: "high",
      isActive: true,
    },
    {
      name: "Termination Rights",
      description: "Checks for fair termination provisions",
      ruleText: "Review termination clauses for fairness. Flag clauses that allow immediate termination without cause, lack reasonable notice periods, or provide one party with significantly more favorable termination rights than the other.",
      category: "Termination",
      severity: "medium",
      isActive: true,
    },
    {
      name: "Intellectual Property",
      description: "Ensures proper IP ownership and licensing terms",
      ruleText: "Check IP-related clauses for clarity on ownership, licensing, and usage rights. Flag clauses that claim ownership of pre-existing IP, require assignment of all IP without consideration, or grant overly broad licenses without restrictions.",
      category: "Intellectual Property",
      severity: "medium",
      isActive: true,
    },
    {
      name: "Payment Terms",
      description: "Validates payment terms and conditions",
      ruleText: "Review payment clauses for reasonableness. Flag clauses with payment terms exceeding 90 days, excessive late fees, or requirements for upfront payment without corresponding deliverables or milestones.",
      category: "Payment",
      severity: "low",
      isActive: true,
    },
  ];

  for (const rule of rules) {
    const existing = await prisma.policyRule.findFirst({
      where: { name: rule.name },
    });

    if (existing) {
      await prisma.policyRule.update({
        where: { id: existing.id },
        data: rule,
      });
      console.log(`Updated rule: ${rule.name}`);
    } else {
      const created = await prisma.policyRule.create({
        data: rule,
      });
      console.log(`Created rule: ${created.name}`);
    }
  }

  // Create a sample agreement for demonstration
  let sampleAgreement = await prisma.agreement.findFirst({
    where: { title: "Sample Service Agreement" },
  });

  if (!sampleAgreement) {
    sampleAgreement = await prisma.agreement.create({
      data: {
        title: "Sample Service Agreement",
      fullText: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on [Date] between Demo Workspace ("Client") and Service Provider ("Provider").

1. SERVICES
Provider agrees to provide software development services to Client. Client grants Provider unlimited access to all Client data for the purpose of providing services.

2. DATA PROCESSING
Provider may process, store, and transfer Client data to any third party without restriction. Client waives all rights to data protection and privacy.

3. LIABILITY
Provider's liability is limited to $0. Provider is not liable for any damages, including but not limited to data breaches, service interruptions, or loss of data.

4. TERMINATION
Client may terminate this Agreement at any time with 1 day notice. Provider may terminate immediately without cause.

5. INTELLECTUAL PROPERTY
All intellectual property created during the term of this Agreement, including pre-existing Client IP, shall be owned exclusively by Provider.

6. PAYMENT
Client agrees to pay Provider within 120 days of invoice receipt. Late fees of 50% per month apply.

7. CONFIDENTIALITY
Provider is not obligated to maintain confidentiality of Client information.

END OF AGREEMENT`,
      entityId: workspace.id,
        status: "draft",
      },
    });
    console.log("Created sample agreement:", sampleAgreement.title);
  } else {
    console.log("Sample agreement already exists:", sampleAgreement.title);
  }
  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

