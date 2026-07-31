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
 * Wall-clock stopwatch — elapsed time from Date.now(), not frame count.
 * Uses setInterval (not rAF) so the tab title keeps updating in background tabs.
 */
const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const startAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const baseTitleRef = useRef<string>('');

  const getElapsed = useCallback(() => {
    if (startAtRef.current != null) {
      return accumulatedRef.current + (Date.now() - startAtRef.current);
    }
    return accumulatedRef.current;
  }, []);

  const paint = useCallback(
    (elapsed: number, running: boolean) => {
      setTime(elapsed);
      if (running) {
        document.title = `${formatTime(elapsed)} · Stopwatch`;
      } else if (elapsed > 0) {
        document.title = `${formatTime(elapsed)} · Stopwatch (paused)`;
      } else {
        document.title = baseTitleRef.current || 'FYN Tools';
      }
    },
    []
  );

  useEffect(() => {
    if (!baseTitleRef.current) {
      baseTitleRef.current = document.title;
    }
    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
      document.title = baseTitleRef.current || 'FYN Tools';
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current != null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isRunning) {
      if (startAtRef.current == null) {
        startAtRef.current = Date.now();
      }

      const tick = () => paint(getElapsed(), true);
      tick();

      // setInterval works in background tabs; rAF is throttled to ~1fps or paused
      intervalRef.current = setInterval(tick, 100);

      const onVisibility = () => {
        if (document.visibilityState === 'visible' && startAtRef.current != null) {
          tick();
        }
      };
      const onFocus = () => {
        if (startAtRef.current != null) tick();
      };
      document.addEventListener('visibilitychange', onVisibility);
      window.addEventListener('focus', onFocus);

      return () => {
        if (intervalRef.current != null) clearInterval(intervalRef.current);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('focus', onFocus);
      };
    }

    if (startAtRef.current != null) {
      accumulatedRef.current += Date.now() - startAtRef.current;
      startAtRef.current = null;
    }
    paint(accumulatedRef.current, false);
  }, [isRunning, getElapsed, paint]);

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
      setTimeout(() => setIsRunning(true), 0);
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
