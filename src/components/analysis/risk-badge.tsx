import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  className?: string;
}

export function RiskBadge({ riskLevel, className }: RiskBadgeProps) {
  const config = {
    green: {
      label: "🟢 Low Risk",
      className:
        "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    },
    yellow: {
      label: "🟡 Medium Risk",
      className:
        "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    },
    red: {
      label: "🔴 High Risk",
      className:
        "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    },
  };

  const { label, className: riskClassName } =
    config[riskLevel as keyof typeof config];

  return (
    <Badge variant="outline" className={cn(riskClassName, className)}>
      {label}
    </Badge>
  );
}
