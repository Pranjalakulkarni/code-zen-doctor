import { BugCard, BugType, SeverityLevel } from "./BugCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface Bug {
  id: string;
  type: BugType;
  severity: SeverityLevel;
  title: string;
  description: string;
  line?: number;
  codeSnippet?: string;
}

interface AnalysisViewProps {
  bugs: Bug[];
  onBack: () => void;
  onViewFix: () => void;
}

export const AnalysisView = ({ bugs, onBack, onViewFix }: AnalysisViewProps) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
          <p className="text-muted-foreground">
            Found {bugs.length} {bugs.length === 1 ? "issue" : "issues"} in your code
          </p>
        </div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
      </div>

      <div className="space-y-4">
        {bugs.map((bug) => (
          <BugCard key={bug.id} {...bug} />
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={onViewFix} size="lg" className="gap-2">
          View Corrected Code
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
