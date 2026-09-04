'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Square } from 'lucide-react';

type ContractionEntry = {
  id: string;
  start: Date;
  end: Date;
  durationSec: number;
  intervalSec: number | null;
};

const formatTime = (seconds: number) => {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
};

const ContractionTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [entries, setEntries] = useState<ContractionEntry[]>([]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (startTime) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsed(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const startTimer = () => {
    setStartTime(new Date());
    setElapsed(0);
    setIsRunning(true);
  };

  const stopTimer = () => {
    if (!startTime) return;
    const end = new Date();
    const duration = Math.floor((end.getTime() - startTime.getTime()) / 1000);
    const lastEntry = entries[0];
    const interval = lastEntry ? Math.floor((startTime.getTime() - lastEntry.end.getTime()) / 1000) : null;
    const newEntry: ContractionEntry = {
      id: `${startTime.toISOString()}-${end.toISOString()}`,
      start: startTime,
      end,
      durationSec: duration,
      intervalSec: interval
    };
    setEntries(prev => [newEntry, ...prev].slice(0, 20));
    setIsRunning(false);
  };

  const averageInterval = useMemo(() => {
    const intervals = entries.map(e => e.intervalSec).filter((v): v is number => typeof v === 'number');
    if (!intervals.length) return null;
    const total = intervals.reduce((sum, val) => sum + val, 0);
    return Math.round(total / intervals.length);
  }, [entries]);

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Contraction Timer
          </CardTitle>
          <CardDescription>Track contraction duration and intervals.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="text-4xl font-bold">{formatTime(elapsed)}</div>
          <div className="flex gap-3">
            {!isRunning ? (
              <Button onClick={startTimer}>
                <Play className="h-4 w-4 mr-2" />
                Start
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopTimer}>
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>
          {averageInterval !== null && (
            <div className="text-sm text-muted-foreground">
              Average interval: {formatTime(averageInterval)}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History Logs</CardTitle>
          <CardDescription>Recent contractions with duration and interval.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-muted-foreground">No contractions logged yet.</div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-3 flex flex-col gap-1 text-sm">
                <div>Start: {entry.start.toLocaleTimeString()}</div>
                <div>Duration: {formatTime(entry.durationSec)}</div>
                <div>Interval: {entry.intervalSec ? formatTime(entry.intervalSec) : '—'}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractionTimer;
