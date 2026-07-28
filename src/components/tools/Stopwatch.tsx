'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw } from 'lucide-react';

const formatTime = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

/**
 * Elapsed-time stopwatch based on Date.now() so background tabs keep accurate time.
 * Also mirrors the running time into document.title.
 */
const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const baseTitleRef = useRef<string>('');

  const tick = useCallback(() => {
    if (startAtRef.current == null) return;
    const elapsed = accumulatedRef.current + (Date.now() - startAtRef.current);
    setTime(elapsed);
    document.title = `${formatTime(elapsed)} · Stopwatch`;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    baseTitleRef.current = document.title;
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      document.title = baseTitleRef.current || 'FYN Tools';
    };
  }, []);

  useEffect(() => {
    if (isRunning) {
      startAtRef.current = Date.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (startAtRef.current != null) {
        accumulatedRef.current += Date.now() - startAtRef.current;
        startAtRef.current = null;
      }
      if (accumulatedRef.current > 0) {
        document.title = `${formatTime(accumulatedRef.current)} · Stopwatch (paused)`;
      } else {
        document.title = baseTitleRef.current || document.title;
      }
    }
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, tick]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleStop = () => {
    setIsRunning(false);
    accumulatedRef.current = 0;
    startAtRef.current = null;
    setTime(0);
    document.title = baseTitleRef.current || 'FYN Tools';
  };
  const handleReset = () => {
    const wasRunning = isRunning;
    setIsRunning(false);
    accumulatedRef.current = 0;
    startAtRef.current = null;
    setTime(0);
    document.title = baseTitleRef.current || 'FYN Tools';
    if (wasRunning) {
      // Allow effect cleanup then restart fresh
      requestAnimationFrame(() => setIsRunning(true));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stopwatch</CardTitle>
          <CardDescription>
            Precise stopwatch that keeps running when you switch tabs. The live time also shows in the browser tab title.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-primary mb-8 tabular-nums">
              {formatTime(time)}
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              {!isRunning ? (
                <Button onClick={handleStart} size="lg" className="gap-2">
                  <Play className="h-5 w-5" />
                  Start
                </Button>
              ) : (
                <Button onClick={handlePause} size="lg" variant="secondary" className="gap-2">
                  <Pause className="h-5 w-5" />
                  Pause
                </Button>
              )}

              <Button onClick={handleStop} size="lg" variant="destructive" className="gap-2">
                <Square className="h-5 w-5" />
                Stop
              </Button>

              <Button onClick={handleReset} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="h-5 w-5" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stopwatch;
