import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const CodeEditor = ({ value, onChange, placeholder, readOnly = false }: CodeEditorProps) => {
  return (
    <Card className="overflow-hidden border-code-border bg-code-bg">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        className="min-h-[400px] resize-none border-0 bg-transparent font-mono text-sm text-white placeholder:text-muted-foreground focus-visible:ring-0"
      />
    </Card>
  );
};
