import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Bug, Shield, Layout, Code } from "lucide-react";

export type BugType = "syntax" | "logic" | "security" | "ui" | "runtime";
export type SeverityLevel = "high" | "medium" | "low";

interface BugCardProps {
  type: BugType;
  severity: SeverityLevel;
  title: string;
  description: string;
  line?: number;
  codeSnippet?: string;
}

const bugIcons = {
  syntax: Code,
  logic: AlertCircle,
  security: Shield,
  ui: Layout,
  runtime: Bug,
};

const bugTypeLabels = {
  syntax: "Syntax Error",
  logic: "Logic Error",
  security: "Security Issue",
  ui: "UI Bug",
  runtime: "Runtime Error",
};

const severityColors = {
  high: "bg-high-severity text-white",
  medium: "bg-medium-severity text-white",
  low: "bg-low-severity text-white",
};

export const BugCard = ({ type, severity, title, description, line, codeSnippet }: BugCardProps) => {
  const Icon = bugIcons[type];

  return (
    <Card className="p-4 transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="rounded-lg bg-muted p-2">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <Badge variant="outline" className="text-xs">
              {bugTypeLabels[type]}
            </Badge>
            <Badge className={`${severityColors[severity]} text-xs font-medium`}>
              {severity.toUpperCase()}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground">{description}</p>
          
          {line && (
            <p className="text-xs text-muted-foreground">Line: {line}</p>
          )}
          
          {codeSnippet && (
            <div className="mt-2 rounded-md bg-code-bg border border-code-border p-3">
              <code className="text-xs text-white font-mono">{codeSnippet}</code>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
