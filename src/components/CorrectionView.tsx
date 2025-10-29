import { CodeEditor } from "./CodeEditor";
import { Button } from "@/components/ui/button";
import { Copy, Download, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

interface CorrectionViewProps {
  correctedCode: string;
  onBack: () => void;
}

export const CorrectionView = ({ correctedCode, onBack }: CorrectionViewProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedCode);
    toast({
      title: "Copied to clipboard",
      description: "Corrected code has been copied successfully",
    });
  };

  const handleDownload = () => {
    const blob = new Blob([correctedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "corrected-code.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: "Your corrected code is being downloaded",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-success" />
            Corrected Code
          </h2>
          <p className="text-muted-foreground">All issues have been automatically fixed</p>
        </div>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Analysis
        </Button>
      </div>

      <Card className="p-4 bg-success/10 border-success/20">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-success mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground">Code Fixed Successfully</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your code has been analyzed and all detected issues have been corrected.
              Review the changes below and use the buttons to copy or download.
            </p>
          </div>
        </div>
      </Card>

      <CodeEditor
        value={correctedCode}
        onChange={() => {}}
        readOnly
        placeholder="No corrected code available"
      />

      <div className="flex gap-3 justify-end">
        <Button onClick={handleCopy} variant="outline" className="gap-2">
          <Copy className="h-4 w-4" />
          Copy Code
        </Button>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download File
        </Button>
      </div>
    </div>
  );
};
