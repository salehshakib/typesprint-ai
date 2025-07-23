"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { AppConfig } from "./app-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";

type TestStatus = "idle" | "running" | "finished";

interface TypingTestProps {
  storyText: string;
  config: AppConfig;
  onStatusChange: (status: TestStatus) => void;
  onRestart: () => void;
  isRestarting: boolean;
}

export function TypingTest({ storyText, config, onStatusChange, onRestart, isRestarting }: TypingTestProps) {
  const [status, setStatus] = useState<TestStatus>("idle");
  const [input, setInput] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [correctCharCount, setCorrectCharCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.mode === 'time' ? config.value : 0);

  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  const start = useCallback(() => {
    if (status === "idle") {
      setStatus("running");
      inputRef.current?.focus();
      if (config.mode === 'time') {
        intervalRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current!);
              setStatus("finished");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      intervalRef.current = timer;
    }
  }, [status, config.mode, config.value]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleReset = (newStory: boolean = false) => {
    if (newStory) {
      onRestart();
      return;
    }
    setStatus("idle");
    setInput("");
    setCharIndex(0);
    setCorrectCharCount(0);
    setErrorCount(0);
    setTimeElapsed(0);
    if(config.mode === 'time') setTimeLeft(config.value);
    if (intervalRef.current) clearInterval(intervalRef.current);
    inputRef.current?.focus();
  };
  
  useEffect(() => {
      if (status === 'running' && config.mode === 'words' && charIndex === storyText.length) {
          setStatus('finished');
          if (intervalRef.current) clearInterval(intervalRef.current);
      }
  }, [charIndex, storyText.length, status, config.mode]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (status === "finished" || isRestarting) return;
    if (status === 'idle') start();

    const key = e.key;

    if (key === "Backspace") {
      if (charIndex > 0) {
        setCharIndex(charIndex - 1);
        if (input[charIndex-1] !== storyText[charIndex-1]) {
           // This logic is complex, as it depends on how we want to track backspace corrections.
           // A simple approach is to not decrement error count on backspace,
           // letting accuracy reflect all errors made.
        }
        setInput(input.slice(0, -1));
      }
    } else if (key.length === 1) {
      if (charIndex < storyText.length) {
        if (key === storyText[charIndex]) {
          setCorrectCharCount(correctCharCount + 1);
        } else {
          setErrorCount(errorCount + 1);
        }
        setCharIndex(charIndex + 1);
        setInput(input + key);
      }
    }
  };

  const wpm =
    timeElapsed > 0
      ? Math.round((correctCharCount / 5 / timeElapsed) * 60)
      : 0;
  const accuracy =
    charIndex > 0
      ? Math.round(((charIndex - errorCount) / charIndex) * 100)
      : 100;

  const words = useMemo(() => {
    return storyText.split(/(\s+)/).filter(Boolean);
  }, [storyText]);

  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    caretRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [charIndex])
  
  let currentStoryIndex = 0;

  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <div className="flex justify-between items-center mb-4 text-lg text-primary">
        {config.mode === 'time' && <div>Time: {timeLeft}s</div>}
        {config.mode === 'words' && <div>Progress: {charIndex} / {storyText.length}</div>}
        <div>WPM: {wpm}</div>
        <div>Acc: {accuracy}%</div>
      </div>
      
      <div
        className="relative text-2xl font-mono tracking-wide leading-relaxed text-left h-48 overflow-y-auto transition-colors"
      >
        <div className="whitespace-pre-wrap">
          {words.map((word, wordIndex) => {
            const wordStartIndex = currentStoryIndex;
            const wordEndIndex = wordStartIndex + word.length;
            currentStoryIndex = wordEndIndex;

            return (
              <span key={`${word}-${wordIndex}`} className="inline-block">
                {word.split('').map((char, charInWordIndex) => {
                  const index = wordStartIndex + charInWordIndex;
                  const isCurrent = index === charIndex;
                  let state: 'correct' | 'incorrect' | 'untyped' = 'untyped';

                  if (index < input.length) {
                    state = input[index] === char ? 'correct' : 'incorrect';
                  }

                  return (
                    <span
                      key={`${char}-${index}`}
                      className={cn({
                        'text-muted-foreground': state === 'untyped',
                        'text-foreground': state === 'correct',
                        'text-destructive': state === 'incorrect',
                        'bg-accent/20': isCurrent,
                      })}
                    >
                      {isCurrent && <span ref={caretRef} className="absolute -ml-[1px] h-7 w-[2px] bg-primary animate-caret-blink" />}
                      {char === ' ' && state === 'incorrect' ? <span className="bg-destructive/50">_</span> : char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </div>
      </div>
      
      {status === 'running' && (
        <div className="absolute bottom-0 right-0">
          <Button variant="ghost" size="icon" onClick={() => handleReset(true)} disabled={isRestarting}>
             {isRestarting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <RefreshCw className="h-5 w-5" />
            )}
          </Button>
        </div>
      )}

      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 opacity-0 w-full h-full cursor-default"
        onKeyDown={handleKeyDown}
        value={input}
        onChange={()=>{}}
        autoFocus
      />
      
      <AlertDialog open={status === "finished"}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-2xl">
              {config.mode === 'time' ? "Time's Up!" : "Story Completed!"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Here are your results. Practice makes perfect!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="rounded-md bg-muted p-4">
              <div className="text-sm font-medium text-muted-foreground">WPM</div>
              <div className="text-4xl font-bold text-primary">{wpm}</div>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="text-sm font-medium text-muted-foreground">Accuracy</div>
              <div className="text-4xl font-bold text-primary">{accuracy}%</div>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="text-sm font-medium text-muted-foreground">Errors</div>
              <div className="text-4xl font-bold text-destructive">{errorCount}</div>
            </div>
            <div className="rounded-md bg-muted p-4">
              <div className="text-sm font-medium text-muted-foreground">Time</div>
              <div className="text-4xl font-bold text-primary">{timeElapsed}s</div>
            </div>
          </div>
          <AlertDialogFooter>
            <Button onClick={() => handleReset(true)} className="w-full">
               {isRestarting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-5 w-5" />
              )}
              Play Again
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
