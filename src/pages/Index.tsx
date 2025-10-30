import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CodeEditor } from "@/components/CodeEditor";
import { AnalysisView } from "@/components/AnalysisView";
import { CorrectionView } from "@/components/CorrectionView";
import { LanguageSelector } from "@/components/LanguageSelector";
import { HistorySidebar, HistoryEntry as HistoryEntryType } from "@/components/HistorySidebar";
import { Button } from "@/components/ui/button";
import { Bug, Sparkles, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type View = "editor" | "analysis" | "correction";

interface AnalysisResult {
  bugs: Array<{
    type: string;
    severity: string;
    line?: number;
    message: string;
    confidence?: number;
  }>;
  correctedCode: string;
  overallConfidence?: number;
}

const Index = () => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [currentView, setCurrentView] = useState<View>("editor");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<HistoryEntryType[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('analysisHistory');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed.map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })));
    }
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/auth");
    }
  };

  const handleAnalyze = async () => {
    if (!language) {
      toast({
        title: "Language not selected",
        description: "Please select a programming language before analyzing",
        variant: "destructive",
      });
      return;
    }

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
        body: { code, language },
      });

      if (error) {
        throw error;
      }

      if (!data || !data.bugs || !data.correctedCode) {
        throw new Error('Invalid response from analysis service');
      }

      setAnalysisResult(data);
      
      // Navigate to analysis view regardless of bug count
      setCurrentView("analysis");
      
      // Add to history with full data
      const newEntry: HistoryEntryType = {
        id: Date.now().toString(),
        timestamp: new Date(),
        bugCount: data.bugs.length,
        code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
        language,
        bugs: data.bugs,
        correctedCode: data.correctedCode,
      };
      const updatedHistory = [newEntry, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));
      
      toast({
        title: "Analysis complete",
        description: data.bugs.length === 0 
          ? "No bugs found! Your code is perfect! 🎉"
          : `Found ${data.bugs.length} issue${data.bugs.length !== 1 ? 's' : ''} with ${data.overallConfidence || 'unknown'}% confidence`,
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

  const handleStartNew = () => {
    setCurrentView("editor");
    setCode("");
    setLanguage("");
    setAnalysisResult(null);
  };

  const handleSelectHistory = (entry: HistoryEntryType) => {
    setCode(entry.code);
    setLanguage(entry.language || "");
    if (entry.bugs && entry.correctedCode) {
      setAnalysisResult({
        bugs: entry.bugs,
        correctedCode: entry.correctedCode,
        overallConfidence: entry.bugs[0]?.confidence,
      });
      setCurrentView("analysis");
    }
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('analysisHistory', JSON.stringify(updatedHistory));
    toast({
      title: "Deleted",
      description: "History entry removed",
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('analysisHistory');
    toast({
      title: "History cleared",
      description: "All history entries have been removed",
    });
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
    confidence: bug.confidence,
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg animate-float">
                <Bug className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Bug Classifier & Corrector
                </h1>
                <p className="text-sm text-muted-foreground">AI-powered code analysis and fixing</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <HistorySidebar
                history={history}
                onSelect={handleSelectHistory}
                onDelete={handleDeleteHistory}
                onClear={handleClearHistory}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2 hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === "editor" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Paste Your Code
              </h2>
              <p className="text-muted-foreground">
                Select your language and let our AI analyze and fix bugs automatically
              </p>
            </div>

            <LanguageSelector value={language} onChange={setLanguage} />

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
                className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                disabled={isAnalyzing || !language}
              >
                <Sparkles className="h-5 w-5" />
                {isAnalyzing ? "🤖 Analyzing..." : "Analyze & Fix Bugs"}
              </Button>
            </div>
          </div>
        )}

        {currentView === "analysis" && analysisResult && (
          <AnalysisView 
            bugs={mappedBugs} 
            onBack={handleBack} 
            onViewFix={handleViewFix}
            onStartNew={handleStartNew}
            overallConfidence={analysisResult.overallConfidence}
          />
        )}

        {currentView === "correction" && analysisResult && (
          <CorrectionView 
            correctedCode={analysisResult.correctedCode} 
            onBack={handleBack}
            onStartNew={handleStartNew}
          />
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
