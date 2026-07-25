'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Baby, Clock, Trash2, RotateCcw, Save, ChevronDown, ChevronUp } from 'lucide-react';

type KickSession = {
  id: string;
  startTime: string;
  endTime: string;
  durationSec: number;
  kicks: number;
};

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const fmtDuration = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(h + 'h');
  if (m > 0 || h > 0) parts.push(m + 'm');
  parts.push(s + 's');
  return parts.join(' ');
};

const TARGET_OPTIONS = [5, 10, 15, 20];
const STORAGE_KEY = 'baby-kick-sessions';

const BabyKickCounter = () => {
  const [startTime, setStartTime] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [kicks, setKicks] = useState(0);
  const [target, setTarget] = useState(10);
  const [sessions, setSessions] = useState<KickSession[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSessions(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!startTime) { setElapsed(0); return; }
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTime]);

  const isActive = startTime !== null;
  const progress = Math.min(100, (kicks / target) * 100);
  const targetReached = kicks >= target;

  const recordKick = useCallback(() => {
    if (!startTime) setStartTime(new Date().toISOString());
    setKicks(prev => prev + 1);
  }, [startTime]);

  const saveSession = useCallback(() => {
    if (kicks === 0 || !startTime) return;
    const now = new Date().toISOString();
    const dur = Math.max(1, Math.floor((Date.now() - new Date(startTime).getTime()) / 1000));
    const session: KickSession = { id: String(Date.now()), startTime, endTime: now, durationSec: dur, kicks };
    setSessions(prev => [session, ...prev].slice(0, 50));
    setStartTime(null);
    setKicks(0);
  }, [kicks, startTime]);

  const resetSession = useCallback(() => {
    setStartTime(null);
    setKicks(0);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, KickSession[]> = {};
    sessions.forEach(s => {
      const key = fmtDate(s.startTime);
      if (!g[key]) g[key] = [];
      g[key].push(s);
    });
    return g;
  }, [sessions]);

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <Card className="overflow-hidden">
        <CardHeader className="text-center pb-3 bg-gradient-to-b from-pink-50/80 to-transparent dark:from-pink-950/20">
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Baby className="h-5 w-5 text-pink-500" />
            Baby Kick Counter
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {isActive ? 'Tap the button each time you feel a kick' : 'Tap the button to start counting'}
          </p>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          <div className="flex justify-center">
            <button
              onClick={recordKick}
              className="relative w-40 h-40 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-150 flex flex-col items-center justify-center gap-1.5 focus:outline-none focus:ring-4 focus:ring-pink-300"
              aria-label="Record a kick"
            >
              <Baby className="h-10 w-10" />
              <span className="text-base font-semibold">
                {isActive ? 'Tap for Kick' : 'Tap to Start'}
              </span>
              {isActive && (
                <span className="text-2xl font-bold leading-none">{kicks}</span>
              )}
            </button>
          </div>

          {isActive && startTime && (
            <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">From</div>
                  <div className="font-semibold font-mono">{fmtTime(startTime)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-0.5">Duration</div>
                  <div className="font-semibold font-mono flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    {fmtDuration(elapsed)}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{kicks} / {target} kicks</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={'h-full rounded-full transition-all duration-300 ' + (targetReached ? 'bg-green-500' : 'bg-pink-500')}
                    style={{ width: progress + '%' }}
                  />
                </div>
              </div>

              {targetReached && (
                <div className="text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg px-3 py-2">
                  Target reached! {kicks} kicks recorded. Save when ready.
                </div>
              )}
              {!targetReached && elapsed > 3600 && (
                <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2">
                  Over 1 hour with fewer kicks than target. Consider contacting your provider.
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button onClick={saveSession} disabled={kicks === 0} className="gap-1.5">
              <Save className="h-4 w-4" />
              Save Session
            </Button>
            <Button variant="outline" onClick={resetSession} disabled={!isActive && kicks === 0} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2 border-t">
            <span className="text-xs text-muted-foreground">Target:</span>
            {TARGET_OPTIONS.map(t => (
              <Button
                key={t}
                size="sm"
                variant={target === t ? 'default' : 'outline'}
                onClick={() => setTarget(t)}
                className="h-7 w-9 text-xs"
              >
                {t}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowHistory(h => !h)}
              className="flex items-center gap-1.5 text-left"
            >
              <CardTitle className="text-base">Session History</CardTitle>
              {showHistory
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {sessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSessions([])}
                className="text-xs text-muted-foreground hover:text-destructive h-7"
              >
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>

        {showHistory && (
          <CardContent className="pt-0 space-y-4">
            {sessions.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground text-sm">
                No sessions saved yet. Tap the button above to start.
              </p>
            ) : (
              Object.entries(grouped).map(([dateLabel, dateSessions]) => (
                <div key={dateLabel} className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{dateLabel}</div>
                  {dateSessions.map(s => (
                    <div key={s.id} className="rounded-lg border p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">From</span>
                          <div className="font-semibold font-mono text-sm">{fmtTime(s.startTime)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">To</span>
                          <div className="font-semibold font-mono text-sm">{fmtTime(s.endTime)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration</span>
                          <div className="font-semibold font-mono text-sm">{fmtDuration(s.durationSec)}</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-dashed">
                        <Badge variant={s.kicks >= target ? 'default' : 'secondary'} className="text-xs">
                          {s.kicks} kick{s.kicks !== 1 ? 's' : ''}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSession(s.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          aria-label="Delete session"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default BabyKickCounter;
