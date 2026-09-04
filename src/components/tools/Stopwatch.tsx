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
 * Wall-clock stopwatch — keeps running when the tab is hidden.
 * Uses Date.now() deltas (not frame counts) so background throttling only delays UI paint, not elapsed time.
 */
const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const runningRef = useRef(false);
  const startAtRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const baseTitleRef = useRef('');

  const getElapsed = useCallback(() => {
    if (runningRef.current && startAtRef.current != null) {
      return accumulatedRef.current + (Date.now() - startAtRef.current);
    }
    return accumulatedRef.current;
  }, []);

  const syncUi = useCallback((elapsed: number, running: boolean) => {
    setTime(elapsed);
    const base = baseTitleRef.current || 'FYN Tools';
    if (running) {
      document.title = `${formatTime(elapsed)} · Stopwatch`;
    } else if (elapsed > 0) {
      document.title = `${formatTime(elapsed)} · Stopwatch (paused)`;
    } else {
      document.title = base;
    }
  }, []);

  useEffect(() => {
    baseTitleRef.current = document.title;

    const tick = () => {
      if (!runningRef.current) return;
      syncUi(getElapsed(), true);
    };

    const intervalId = setInterval(tick, 100);

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && runningRef.current) {
        syncUi(getElapsed(), true);
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onVisibility);
      document.title = baseTitleRef.current || 'FYN Tools';
    };
  }, [getElapsed, syncUi]);

  const handleStart = () => {
    if (runningRef.current) return;
    runningRef.current = true;
    startAtRef.current = Date.now();
    setIsRunning(true);
    syncUi(getElapsed(), true);
  };

  const handlePause = () => {
    if (!runningRef.current) return;
    if (startAtRef.current != null) {
      accumulatedRef.current += Date.now() - startAtRef.current;
    }
    startAtRef.current = null;
    runningRef.current = false;
    setIsRunning(false);
    syncUi(accumulatedRef.current, false);
  };

  const handleStop = () => {
    runningRef.current = false;
    startAtRef.current = null;
    accumulatedRef.current = 0;
    setIsRunning(false);
    setTime(0);
    document.title = baseTitleRef.current || 'FYN Tools';
  };

  const handleReset = () => {
    const wasRunning = runningRef.current;
    runningRef.current = false;
    startAtRef.current = null;
    accumulatedRef.current = 0;
    setIsRunning(false);
    setTime(0);
    document.title = baseTitleRef.current || 'FYN Tools';
    if (wasRunning) {
      requestAnimationFrame(() => handleStart());
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Stopwatch</CardTitle>
          <CardDescription>
            Keeps running when you switch tabs — live time shows in the browser tab title. Elapsed time uses your
            device clock, not animation frames.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-mono font-bold text-primary mb-8 tabular-nums tracking-tight">
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
