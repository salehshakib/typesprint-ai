"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Keyboard,
  Hash,
  Pilcrow,
  Timer,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type WordCountValue = 10 | 25 | 50;
export type TimeValue = 15 | 30 | 45 | 60;

export interface AppConfig {
  includePunctuation: boolean;
  includeNumbers: boolean;
  mode: "time" | "words";
  value: TimeValue | WordCountValue;
}

interface AppHeaderProps {
  onGenerate: (config: AppConfig) => void;
  isGenerating: boolean;
}

const timeOptions: { label: string; value: TimeValue }[] = [
  { label: "15", value: 15 },
  { label: "30", value: 30 },
  { label: "45", value: 45 },
  { label: "60", value: 60 },
];
const wordOptions: { label: string; value: WordCountValue }[] = [
  { label: "small", value: 10 },
  { label: "medium", value: 25 },
  { label: "large", value: 50 },
];

export function AppHeader({ onGenerate, isGenerating }: AppHeaderProps) {
  const [config, setConfig] = useState<AppConfig>({
    includePunctuation: false,
    includeNumbers: false,
    mode: "words",
    value: 25,
  });

  const handleModeChange = (mode: "time" | "words") => {
    setConfig((prev) => ({
      ...prev,
      mode,
      value: mode === "time" ? 30 : 25,
    }));
  };

  const handleValueChange = (value: string) => {
    setConfig((prev) => ({ ...prev, value: Number(value) as AppConfig['value'] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(config);
  };

  const options = config.mode === "time" ? timeOptions : wordOptions;

  return (
    <header className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <Keyboard className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-4xl font-bold tracking-tight text-white">
          TypeSprint AI
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:justify-between"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfig(c => ({...c, includePunctuation: !c.includePunctuation}))}
            disabled={isGenerating}
            className={cn("transition-colors", {
              "bg-primary text-primary-foreground hover:bg-primary/90": config.includePunctuation,
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground": !config.includePunctuation,
            })}
          >
            <Pilcrow size={16} /> Punctuation
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setConfig(c => ({...c, includeNumbers: !c.includeNumbers}))}
            disabled={isGenerating}
            className={cn("transition-colors", {
              "bg-primary text-primary-foreground hover:bg-primary/90": config.includeNumbers,
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground": !config.includeNumbers,
            })}
          >
            <Hash size={16} /> Numbers
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Tabs
            value={config.mode}
            onValueChange={(value) => handleModeChange(value as "time" | "words")}
          >
            <TabsList>
              <TabsTrigger value="time" disabled={isGenerating}>
                <Timer size={16} className="mr-2" /> Time
              </TabsTrigger>
              <TabsTrigger value="words" disabled={isGenerating}>
                <FileText size={16} className="mr-2" /> Words
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={String(config.value)} onValueChange={handleValueChange}>
            <TabsList>
              {options.map((option) => (
                <TabsTrigger key={option.value} value={String(option.value)} disabled={isGenerating}>
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-5 w-5" />
          )}
          New Story
        </Button>
      </form>
    </header>
  );
}
