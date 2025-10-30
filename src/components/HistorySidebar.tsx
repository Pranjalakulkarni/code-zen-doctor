import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileCode, Trash2, ChevronRight, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  bugCount: number;
  code: string;
  language?: string;
  bugs?: Array<any>;
  correctedCode?: string;
}

interface HistorySidebarProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const HistorySidebar = ({ history, onSelect, onDelete, onClear }: HistorySidebarProps) => {
  const [open, setOpen] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/40">
          <Clock className="h-4 w-4" />
          Recent Analysis ({history.length})
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-card p-0">
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <FileCode className="h-5 w-5 text-primary" />
            Recent Analysis
          </SheetTitle>
        </SheetHeader>
        
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-muted-foreground">
            <Clock className="h-16 w-16 mb-4 opacity-20" />
            <p className="text-lg">No analysis history yet</p>
            <p className="text-sm">Start by analyzing some code!</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-3 flex justify-between items-center border-b bg-muted/30">
              <p className="text-sm text-muted-foreground">
                {history.length} {history.length === 1 ? "entry" : "entries"}
              </p>
              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={onClear} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-[calc(100vh-180px)]">
              <div className="p-4 space-y-3">
                {history.map((entry) => (
                  <Card
                    key={entry.id}
                    className="p-4 hover:border-primary/50 transition-all cursor-pointer group bg-gradient-to-br from-card to-muted/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0" onClick={() => {
                        onSelect(entry);
                        setOpen(false);
                      }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-3 w-3 text-primary flex-shrink-0" />
                          <span className="text-xs text-muted-foreground">
                            {formatTime(entry.timestamp)}
                          </span>
                          {entry.language && (
                            <Badge variant="outline" className="text-xs bg-secondary/10 border-secondary">
                              {entry.language.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground font-mono truncate mb-2">
                          {entry.code}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={entry.bugCount === 0 ? "default" : "secondary"}
                            className={entry.bugCount === 0 ? "bg-success" : ""}
                          >
                            {entry.bugCount} {entry.bugCount === 1 ? "bug" : "bugs"}
                          </Badge>
                          <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(entry.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
