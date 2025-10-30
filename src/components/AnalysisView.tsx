import { BugCard, BugType, SeverityLevel } from "./BugCard";
import { BugStatsCard } from "./BugStatsCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, ThumbsUp, ThumbsDown, Brain } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Bug {
  id: string;
  type: BugType;
  severity: SeverityLevel;
  title: string;
  description: string;
  line?: number;
  codeSnippet?: string;
  confidence?: number;
}

interface AnalysisViewProps {
  bugs: Bug[];
  onBack: () => void;
  onViewFix: () => void;
  onStartNew: () => void;
  overallConfidence?: number;
}

export const AnalysisView = ({ bugs, onBack, onViewFix, onStartNew, overallConfidence }: AnalysisViewProps) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const { toast } = useToast();

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type);
    toast({
      title: type === 'positive' ? "Thanks for your feedback!" : "Feedback received",
      description: type === 'positive' 
        ? "Glad the analysis was helpful!" 
        : "We'll work on improving our accuracy.",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">🤖 Analysis Results</h2>
          <p className="text-muted-foreground">
            Found {bugs.length} {bugs.length === 1 ? "issue" : "issues"} in your code
          </p>
        </div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Editor
        </Button>
      </div>

      {overallConfidence && (
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">AI Confidence Score</h3>
              <p className="text-sm text-muted-foreground">
                Overall detection accuracy: <span className="font-bold text-primary">{overallConfidence}%</span>
              </p>
            </div>
            <div className="text-3xl">
              {overallConfidence >= 90 ? "🎯" : overallConfidence >= 70 ? "🔍" : "⚠️"}
            </div>
          </div>
        </Card>
      )}

      <BugStatsCard bugs={bugs} />

      <div className="space-y-4">
        {bugs.map((bug) => (
          <BugCard key={bug.id} {...bug} />
        ))}
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Was this analysis helpful?</h3>
            <p className="text-sm text-muted-foreground">Your feedback helps us improve</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={feedback === 'positive' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFeedback('positive')}
              className="gap-2"
            >
              <ThumbsUp className="h-4 w-4" />
              Correct
            </Button>
            <Button
              variant={feedback === 'negative' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => handleFeedback('negative')}
              className="gap-2"
            >
              <ThumbsDown className="h-4 w-4" />
              Wrong
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-between pt-4">
        <Button onClick={onStartNew} size="lg" variant="outline" className="gap-2 bg-gradient-to-r from-secondary/10 to-primary/10">
          <ArrowLeft className="h-4 w-4" />
          Start New Code
        </Button>
        <Button onClick={onViewFix} size="lg" className="gap-2 bg-gradient-to-r from-primary to-accent">
          View Corrected Code
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
