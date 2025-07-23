"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Keyboard,
  Hash,
  Pilcrow,
  Timer,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";

export interface AppConfig {
  includePunctuation: boolean;
  includeNumbers: boolean;
  mode: "time" | "words";
  value: 15 | 30 | 60 | 10 | 25 | 50;
}

interface AppHeaderProps {
  onGenerate: (config: AppConfig) => void;
  isGenerating: boolean;
}

const timeOptions = [15, 30, 60] as const;
const wordOptions = [10, 25, 50] as const;

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
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="punctuation"
              checked={config.includePunctuation}
              onCheckedChange={(checked) =>
                setConfig((c) => ({ ...c, includePunctuation: checked }))
              }
              disabled={isGenerating}
            />
            <Label htmlFor="punctuation" className="flex items-center gap-1.5">
              <Pilcrow size={16} /> Punctuation
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="numbers"
              checked={config.includeNumbers}
              onCheckedChange={(checked) =>
                setConfig((c) => ({ ...c, includeNumbers: checked }))
              }
              disabled={isGenerating}
            />
            <Label htmlFor="numbers" className="flex items-center gap-1.5">
              <Hash size={16} /> Numbers
            </Label>
          </div>
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
                <TabsTrigger key={option} value={String(option)} disabled={isGenerating}>
                  {option}
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
          Go
        </Button>
      </form>
    </header>
  );
}
