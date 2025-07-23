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

interface TypingTestProps {
  storyText: string;
  config: AppConfig;
}

export function TypingTest({ storyText, config }: TypingTestProps) {
  const [status, setStatus] = useState<"idle" | "running" | "finished">(
    "idle"
  );
  const [input, setInput] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [correctCharCount, setCorrectCharCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.mode === 'time' ? config.value : 0);

  const inputRef = useRef<HTMLInputElement>(null);
  const words = useMemo(() => storyText.split(" "), [storyText]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleReset = () => {
    setStatus("idle");
    setInput("");
    setCharIndex(0);
    setCorrectCharCount(0);
    setErrorCount(0);
    setTimeElapsed(0);
    if(config.mode === 'time') setTimeLeft(config.value);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  
  useEffect(() => {
      if (status === 'running' && config.mode === 'words' && charIndex === storyText.length) {
          setStatus('finished');
          if (intervalRef.current) clearInterval(intervalRef.current);
      }
  }, [charIndex, storyText.length, status, config.mode]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (status === "finished") return;
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

  const wordsTyped = input.trim().split(" ").filter(Boolean).length;
  const wpm =
    timeElapsed > 0
      ? Math.round((correctCharCount / 5 / timeElapsed) * 60)
      : 0;
  const accuracy =
    charIndex > 0
      ? Math.round(((charIndex - errorCount) / charIndex) * 100)
      : 100;

  const characters = useMemo(() => {
    return storyText.split("").map((char, index) => {
      let state: "correct" | "incorrect" | "untyped" = "untyped";
      if (index < input.length) {
        state = input[index] === char ? "correct" : "incorrect";
      }
      return { char, state, isCurrent: index === charIndex };
    });
  }, [storyText, charIndex, input]);
  
  const caretRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    caretRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [charIndex])

  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <div className="flex justify-between items-center mb-4 text-lg text-primary">
        {config.mode === 'time' && <div>Time: {timeLeft}s</div>}
        {config.mode === 'words' && <div>Progress: {charIndex} / {storyText.length}</div>}
        <div>WPM: {wpm}</div>
        <div>Acc: {accuracy}%</div>
      </div>
      
      <div
        className="relative text-2xl font-mono tracking-wide leading-relaxed text-left h-48 overflow-hidden"
      >
        <div className="whitespace-pre-wrap break-words">
          {characters.map(({ char, state, isCurrent }, index) => (
            <span
              key={index}
              className={cn({
                "text-muted-foreground": state === "untyped" && index >= charIndex,
                "text-foreground": state === "correct",
                "text-destructive": state === "incorrect",
                "bg-accent/20": isCurrent,
              })}
            >
              {isCurrent && <span ref={caretRef} className="absolute -ml-[1px] h-7 w-[2px] bg-primary animate-caret-blink" />}
              {char === ' ' && state === 'incorrect' ? <span className="bg-destructive/50">_</span> : char}
            </span>
          ))}
        </div>
        
      </div>
      <input
        ref={inputRef}
        type="text"
        className="absolute inset-0 opacity-0 w-full h-full cursor-default"
        onKeyDown={handleKeyDown}
        value={input}
        onChange={()=>{}}
        onBlur={() => {
            if(status === 'running') inputRef.current?.focus()
        }}
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
            <AlertDialogAction onClick={handleReset} className="w-full">
              Play Again
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
