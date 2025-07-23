"use client";

import { useState } from "react";
import type { GenerateTypingStoryInput } from "@/ai/flows/generate-typing-story";
import { generateStoryAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

import { AppHeader, type AppConfig } from "@/components/app/app-header";
import { TypingTest } from "@/components/app/typing-test";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, Twitter } from "lucide-react";

export default function Home() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [story, setStory] = useState<{ id: string; text: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async (newConfig: AppConfig) => {
    setIsGenerating(true);
    setConfig(newConfig);
    setStory(null); // Clear previous story

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl">
        <AppHeader onGenerate={handleGenerate} isGenerating={isGenerating} />

        <Card className="mt-6 sm:mt-8">
          <CardContent className="p-6 sm:p-8">
            {isGenerating && (
              <div className="space-y-2">
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
              />
            )}
            {!isGenerating && !story && (
              <div className="flex h-40 items-center justify-center text-center">
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
    </div>
  );
}
