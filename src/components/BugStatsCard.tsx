import { Card } from "@/components/ui/card";
import { Bug, AlertCircle, Shield, Layout, Code } from "lucide-react";

interface BugStatsCardProps {
  bugs: Array<{
    type: string;
    severity: string;
  }>;
}

export const BugStatsCard = ({ bugs }: BugStatsCardProps) => {
  const stats = {
    syntax: bugs.filter(b => b.type.toLowerCase().includes('syntax')).length,
    logic: bugs.filter(b => b.type.toLowerCase().includes('logic')).length,
    security: bugs.filter(b => b.type.toLowerCase().includes('security')).length,
    ui: bugs.filter(b => b.type.toLowerCase().includes('ui')).length,
    runtime: bugs.filter(b => b.type.toLowerCase().includes('runtime')).length,
  };

  const severityStats = {
    high: bugs.filter(b => b.severity === 'High').length,
    medium: bugs.filter(b => b.severity === 'Medium').length,
    low: bugs.filter(b => b.severity === 'Low').length,
  };

  const total = bugs.length;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Bug Statistics</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="flex flex-col items-center p-3 rounded-lg bg-card border">
            <Code className="h-4 w-4 text-blue-500 mb-1" />
            <span className="text-2xl font-bold text-foreground">{stats.syntax}</span>
            <span className="text-xs text-muted-foreground">Syntax</span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-card border">
            <AlertCircle className="h-4 w-4 text-purple-500 mb-1" />
            <span className="text-2xl font-bold text-foreground">{stats.logic}</span>
            <span className="text-xs text-muted-foreground">Logic</span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-card border">
            <Shield className="h-4 w-4 text-red-500 mb-1" />
            <span className="text-2xl font-bold text-foreground">{stats.security}</span>
            <span className="text-xs text-muted-foreground">Security</span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-card border">
            <Layout className="h-4 w-4 text-green-500 mb-1" />
            <span className="text-2xl font-bold text-foreground">{stats.ui}</span>
            <span className="text-xs text-muted-foreground">UI</span>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-card border">
            <Bug className="h-4 w-4 text-orange-500 mb-1" />
            <span className="text-2xl font-bold text-foreground">{stats.runtime}</span>
            <span className="text-xs text-muted-foreground">Runtime</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Severity Distribution</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-2 bg-high-severity rounded-full" style={{ flex: severityStats.high }} />
            <div className="flex-1 h-2 bg-medium-severity rounded-full" style={{ flex: severityStats.medium }} />
            <div className="flex-1 h-2 bg-low-severity rounded-full" style={{ flex: severityStats.low }} />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>🔥 {severityStats.high} High</span>
            <span>🟠 {severityStats.medium} Medium</span>
            <span>🟢 {severityStats.low} Low</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
