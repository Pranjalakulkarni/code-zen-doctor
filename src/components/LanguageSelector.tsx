import { Code } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const languages = [
  { value: "c", label: "C" },
  { value: "cpp", label: "C++" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "php", label: "PHP" },
  { value: "html", label: "HTML" },
  { value: "r", label: "R" },
];

export const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-base font-semibold">
        <Code className="h-5 w-5 text-primary" />
        Select Programming Language *
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-card border-2 hover:border-primary transition-colors">
          <SelectValue placeholder="Choose your programming language..." />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value} className="cursor-pointer">
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!value && (
        <p className="text-sm text-warning flex items-center gap-1">
          ⚠️ Please select a language before analyzing
        </p>
      )}
    </div>
  );
};
