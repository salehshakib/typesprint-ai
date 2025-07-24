"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { AppConfig } from "./app-header";
import {
  AlertDialog,
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
  onRestart: (isNewStory?: boolean) => void;
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  const stopTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    intervalRef.current = null;
    timerRef.current = null;
  }, []);

  const start = useCallback(() => {
    if (status === "idle") {
      setStatus("running");
      inputRef.current?.focus();
      
      if (config.mode === 'time') {
        setTimeLeft(config.value);
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              stopTimers();
              setStatus("finished");
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
  }, [status, config.mode, config.value, stopTimers]);
  
  useEffect(() => {
    return stopTimers;
  }, [stopTimers]);

  useEffect(() => {
      if (status === 'running' && charIndex === storyText.length) {
          setStatus('finished');
          stopTimers();
      }
  }, [charIndex, storyText.length, status, stopTimers]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (status === "finished" || isRestarting) return;
    if (status === 'idle' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Control' && e.key !== 'Meta') start();

    const key = e.key;

    if (key === "Backspace") {
      if (charIndex > 0) {
        setCharIndex(charIndex - 1);
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

  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    caretRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [charIndex]);
  
  const characters = useMemo(() => storyText.split(''), [storyText]);

  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <div className="flex justify-between items-center mb-4 text-lg text-primary">
        {config.mode === 'time' && <div>Time: {timeLeft}s</div>}
        {config.mode === 'words' && <div>Progress: {charIndex} / {storyText.length}</div>}
        <div>WPM: {wpm}</div>
        <div>Acc: {accuracy}%</div>
      </div>
      
      <div
        className="relative text-2xl font-mono tracking-wide leading-relaxed text-left h-auto min-h-[30rem] overflow-y-auto"
      >
        <div className="text-muted-foreground whitespace-pre-wrap">
          {characters.map((char, index) => {
            const isTyped = index < charIndex;
            const isCurrent = index === charIndex;
            const isCorrect = isTyped && input[index] === char;

            return (
              <span
                key={`${char}-${index}`}
                className={cn({
                  "text-foreground": isTyped && isCorrect,
                  "text-destructive": isTyped && !isCorrect,
                  "text-muted-foreground": !isTyped,
                  "relative": isCurrent
                })}
              >
                {isCurrent && (
                  <span
                    ref={caretRef}
                    className="absolute left-0 h-7 w-[2px] bg-primary animate-caret-blink"
                  />
                )}
                {char}
              </span>
            );
          })}
        </div>
      </div>

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
          <AlertDialogFooter className="sm:justify-start flex-col sm:flex-row gap-2">
            <Button onClick={() => onRestart(false)} className="w-full" disabled={isRestarting}>
               {isRestarting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-5 w-5" />
              )}
              Play Again
            </Button>
            <Button onClick={() => onRestart(true)} className="w-full" disabled={isRestarting}>
               {isRestarting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-5 w-5" />
              )}
              New Story
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
