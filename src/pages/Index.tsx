import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";
import { AnalysisView } from "@/components/AnalysisView";
import { CorrectionView } from "@/components/CorrectionView";
import { Button } from "@/components/ui/button";
import { Bug, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type View = "editor" | "analysis" | "correction";

// Mock data for demonstration
const mockBugs = [
  {
    id: "1",
    type: "syntax" as const,
    severity: "high" as const,
    title: "Missing semicolon",
    description: "Statement should end with a semicolon to avoid potential issues",
    line: 12,
    codeSnippet: "const result = calculateValue()",
  },
  {
    id: "2",
    type: "logic" as const,
    severity: "medium" as const,
    title: "Unreachable code detected",
    description: "Code after return statement will never be executed",
    line: 24,
    codeSnippet: "return value;\nconsole.log('This will never run');",
  },
  {
    id: "3",
    type: "security" as const,
    severity: "high" as const,
    title: "SQL Injection vulnerability",
    description: "User input is directly concatenated into SQL query without sanitization",
    line: 45,
    codeSnippet: "const query = 'SELECT * FROM users WHERE id=' + userId;",
  },
];

const Index = () => {
  const [code, setCode] = useState("");
  const [currentView, setCurrentView] = useState<View>("editor");
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!code.trim()) {
      toast({
        title: "No code to analyze",
        description: "Please enter some code before analyzing",
        variant: "destructive",
      });
      return;
    }

    // Simulate analysis
    toast({
      title: "Analyzing code...",
      description: "This may take a few moments",
    });

    setTimeout(() => {
      setCurrentView("analysis");
    }, 1000);
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

  const mockCorrectedCode = `// Fixed code with all issues resolved
const result = calculateValue();

function processData(value) {
  return value;
  // Removed unreachable code
}

// Using parameterized query to prevent SQL injection
const query = 'SELECT * FROM users WHERE id = ?';
const result = db.execute(query, [userId]);`;

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
              <Button onClick={handleAnalyze} size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Analyze & Fix Bugs
              </Button>
            </div>
          </div>
        )}

        {currentView === "analysis" && (
          <AnalysisView bugs={mockBugs} onBack={handleBack} onViewFix={handleViewFix} />
        )}

        {currentView === "correction" && (
          <CorrectionView correctedCode={mockCorrectedCode} onBack={handleBack} />
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
