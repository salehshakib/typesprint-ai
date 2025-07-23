"use client";

import { useState } from "react";
import type { GenerateTypingStoryInput } from "@/ai/flows/generate-typing-story";
import { generateStoryAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { AppHeader, type AppConfig } from "@/components/app/app-header";
import { TypingTest } from "@/components/app/typing-test";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Focus, Github, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [story, setStory] = useState<{ id: string; text: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTypingTestFocused, setIsTypingTestFocused] = useState(true);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const { toast } = useToast();

  const handleGenerate = async (newConfig: AppConfig) => {
    setIsGenerating(true);
    setConfig(newConfig);
    setStory(null); // Clear previous story
    setIsTestRunning(false);

    try {
      const result = await generateStoryAction({
        includeNumbers: newConfig.includeNumbers,
        includePunctuation: newConfig.includePunctuation,
        includeAlphabet: newConfig.includeAlphabet,
        wordCount: Number(newConfig.value),
      });
      // Using Date.now() as a simple unique ID to force re-mounting of the TypingTest component
      setStory({ id: `${Date.now()}`, text: result.story });
      setIsTypingTestFocused(true); // Auto-focus on new story
    } catch (error) {
      console.error("Failed to generate story:", error);
      toast({
        title: "Error",
        description: "Failed to generate a new story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const showOverlay = !isTypingTestFocused && isTestRunning && story;

  return (
    <div className={cn("flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8", {
      'blur-[2px]': showOverlay,
    })}>
      <div className="w-full max-w-5xl">
        <AppHeader onGenerate={handleGenerate} isGenerating={isGenerating} />

        <Card className="mt-6 sm:mt-8">
          <CardContent className="p-6 sm:p-8">
            {isGenerating && (
              <div className="h-48 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            )}
            {story && config && (
              <TypingTest
                key={story.id}
                storyText={story.text}
                config={config}
                onFocusChange={setIsTypingTestFocused}
                onStatusChange={(status) => setIsTestRunning(status === 'running' || status === 'idle')}
              />
            )}
            {!isGenerating && !story && (
              <div className="flex h-48 items-center justify-center text-center">
                <p className="text-muted-foreground">
                  Select your preferences above and click 'Go' to start typing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <footer className="mt-8 text-center text-muted-foreground">
          <p>Built with Next.js and Firebase Genkit.</p>
          <div className="mt-2 flex justify-center gap-4">
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Github size={20} />
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              <Twitter size={20} />
            </a>
          </div>
        </footer>
      </div>

      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2 text-foreground">
            <Focus size={32} />
            <p className="text-lg font-medium">Click here or press any key to continue</p>
          </div>
        </div>
      )}
    </div>
  );
}
