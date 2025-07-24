"use client";

import { useState, useEffect } from "react";
import type { GenerateTypingStoryInput } from "@/ai/flows/generate-typing-story";
import { generateStoryAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { AppHeader, type AppConfig } from "@/components/app/app-header";
import { TypingTest } from "@/components/app/typing-test";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Mouse, Github, Twitter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meteors } from "@/components/ui/meteors";

export default function Home() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [story, setStory] = useState<{ id: string; text: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

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

  const handleRestart = async (isNewStory: boolean = false) => {
    if (isNewStory) {
      if (config) {
        await handleGenerate(config);
      }
    } else {
      setStory(null);
      setConfig(null);
      setIsTestRunning(false);
    }
  };
  
  const showOverlay = !isWindowFocused && isTestRunning && story;

  return (
    <div className="relative min-h-screen overflow-hidden bg-grid-pattern">
      <Meteors number={20} />
      <div
        className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 transition-all"
      >
        <div className="w-full max-w-5xl">
          <AppHeader onGenerate={handleGenerate} isGenerating={isGenerating} />
          <div className="relative mt-6 sm:mt-8">
            <div className="absolute inset-0 h-full w-full scale-[0.80] transform rounded-full bg-red-500 bg-gradient-to-r from-blue-500 to-teal-500 blur-3xl" />
            <Card className="overflow-hidden">
              <CardContent className="p-6 sm:p-8 relative bg-card/80 backdrop-blur-sm">
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
                    onStatusChange={(status) =>
                      setIsTestRunning(status === "running" || status === "idle")
                    }
                    onRestart={handleRestart}
                    isRestarting={isGenerating}
                  />
                )}
                {!isGenerating && !story && (
                  <div className="flex h-48 items-center justify-center text-center">
                    <p className="text-muted-foreground">
                      Select your preferences above and click 'Go' to start
                      typing.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <footer className="mt-8 text-center text-muted-foreground">
            <p>Built with Next.js and Firebase Genkit.</p>
            <div className="mt-2 flex justify-center gap-4">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                <Twitter size={20} />
              </a>
            </div>
          </footer>
        </div>
      </div>
      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-foreground">
            <Mouse size={24} />
            <p className="text-lg font-medium">
              Click here or press any key to continue
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
