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

  // Load history from database on mount
  useEffect(() => {
    const loadHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('analysis_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading history:', error);
        return;
      }

      if (data) {
        const mappedHistory: HistoryEntryType[] = data.map((item) => ({
          id: item.id,
          timestamp: new Date(item.created_at),
          bugCount: item.bug_count,
          code: item.code.substring(0, 100) + (item.code.length > 100 ? '...' : ''),
          language: item.language,
          bugs: item.bugs as any,
          correctedCode: item.corrected_code,
        }));
        setHistory(mappedHistory);
      }
    };

    loadHistory();
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
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: insertedData, error: insertError } = await supabase
          .from('analysis_history')
          .insert({
            user_id: user.id,
            code,
            language,
            bug_count: data.bugs.length,
            bugs: data.bugs,
            corrected_code: data.correctedCode,
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error saving to history:', insertError);
        } else if (insertedData) {
          // Add to local state
          const newEntry: HistoryEntryType = {
            id: insertedData.id,
            timestamp: new Date(insertedData.created_at),
            bugCount: insertedData.bug_count,
            code: code.substring(0, 100) + (code.length > 100 ? '...' : ''),
            language: insertedData.language,
            bugs: insertedData.bugs as any,
            correctedCode: insertedData.corrected_code,
          };
          setHistory([newEntry, ...history].slice(0, 10));
        }
      }
      
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

  const handleSelectHistory = async (entry: HistoryEntryType) => {
    // Load full code from database
    const { data, error } = await supabase
      .from('analysis_history')
      .select('*')
      .eq('id', entry.id)
      .single();

    if (error || !data) {
      toast({
        title: "Error",
        description: "Failed to load history entry",
        variant: "destructive",
      });
      return;
    }

    setCode(data.code);
    setLanguage(data.language || "");
    if (data.bugs && data.corrected_code) {
      setAnalysisResult({
        bugs: data.bugs as any,
        correctedCode: data.corrected_code,
        overallConfidence: (data.bugs as any)[0]?.confidence,
      });
      setCurrentView("analysis");
    }
  };

  const handleDeleteHistory = async (id: string) => {
    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete history entry",
        variant: "destructive",
      });
      return;
    }

    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    toast({
      title: "Deleted",
      description: "History entry removed",
    });
  };

  const handleClearHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('analysis_history')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
      return;
    }

    setHistory([]);
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
              <div className="rounded-xl bg-gradient-to-br from-primary to-accent p-3 shadow-lg">
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
          <>
            {mappedBugs.length === 0 ? (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-6 py-12">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-success/10 p-8">
                      <svg
                        className="h-24 w-24 text-success"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-success">
                    Code is correct!
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    No bugs found. Great job!
                  </p>
                  <div className="flex justify-center gap-4 pt-6">
                    <Button onClick={handleBack} variant="outline" size="lg">
                      Back to Editor
                    </Button>
                    <Button onClick={handleStartNew} size="lg" className="gap-2">
                      <Sparkles className="h-5 w-5" />
                      Start New Code
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <AnalysisView 
                bugs={mappedBugs} 
                onBack={handleBack} 
                onViewFix={handleViewFix}
                onStartNew={handleStartNew}
                overallConfidence={analysisResult.overallConfidence}
              />
            )}
          </>
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
