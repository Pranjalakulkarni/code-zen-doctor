import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { AnalysisView } from "@/components/AnalysisView";
import { CorrectionView } from "@/components/CorrectionView";
import { Button } from "@/components/ui/button";
import { Bug, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type View = "editor" | "analysis" | "correction";

interface AnalysisResult {
  bugs: Array<{
    type: string;
    severity: string;
    line?: number;
    message: string;
  }>;
  correctedCode: string;
}

const Index = () => {
  const [code, setCode] = useState("");
  const [currentView, setCurrentView] = useState<View>("editor");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to analyze",
        description: "Please enter some code before analyzing",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    toast({
      title: "Analyzing code...",
      description: "This may take a few moments",
    });

    try {
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { code },
      });

      if (error) {
        throw error;
      }

      if (!data || !data.bugs || !data.correctedCode) {
        throw new Error('Invalid response from analysis service');
      }

      setAnalysisResult(data);
      setCurrentView("analysis");
      
      toast({
        title: "Analysis complete",
        description: `Found ${data.bugs.length} issue${data.bugs.length !== 1 ? 's' : ''}`,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleViewFix = () => {
    setCurrentView("correction");
  };

  const handleBack = () => {
    if (currentView === "correction") {
      setCurrentView("analysis");
    } else {
      setCurrentView("editor");
    }
  };

  // Map API bug format to component format
  const mappedBugs = analysisResult?.bugs.map((bug, index) => ({
    id: String(index + 1),
    type: bug.type.toLowerCase().includes('syntax') ? 'syntax' as const :
          bug.type.toLowerCase().includes('logic') ? 'logic' as const :
          bug.type.toLowerCase().includes('security') ? 'security' as const :
          bug.type.toLowerCase().includes('ui') ? 'ui' as const : 'runtime' as const,
    severity: bug.severity.toLowerCase() as 'high' | 'medium' | 'low',
    title: bug.type,
    description: bug.message,
    line: bug.line,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Bug className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bug Classifier & Corrector</h1>
              <p className="text-sm text-muted-foreground">AI-powered code analysis and fixing</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === "editor" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Paste Your Code</h2>
              <p className="text-muted-foreground">
                Enter your code below and let our AI analyze and fix bugs automatically
              </p>
            </div>

            <CodeEditor
              value={code}
              onChange={setCode}
              placeholder="// Paste or type your code here...
function example() {
  const result = calculateValue()
  return result
}"
            />

            <div className="flex justify-center">
              <Button 
                onClick={handleAnalyze} 
                size="lg" 
                className="gap-2"
                disabled={isAnalyzing}
              >
                <Sparkles className="h-5 w-5" />
                {isAnalyzing ? "Analyzing..." : "Analyze & Fix Bugs"}
              </Button>
            </div>
          </div>
        )}

        {currentView === "analysis" && analysisResult && (
          <AnalysisView bugs={mappedBugs} onBack={handleBack} onViewFix={handleViewFix} />
        )}

        {currentView === "correction" && analysisResult && (
          <CorrectionView correctedCode={analysisResult.correctedCode} onBack={handleBack} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Powered by AI • Detects syntax, logic, security, and UI bugs</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
